"use client";

import { createContext, useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const refreshTimerRef = useRef(null);

    const VITE_API_URL = import.meta.env.VITE_API_URL;

    const clearRefreshTimer = useCallback(() => {
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }
    }, []);

    const refreshAccessToken = useCallback(async () => {
        try {
            const refreshToken = localStorage.getItem("refresh_token");
            if (!refreshToken) {
                throw new Error("No refresh token available");
            }

            const response = await axios.post(
                `${VITE_API_URL}/token/refresh/`,
                { refresh: refreshToken }
            );

            const { access } = response.data;
            localStorage.setItem("access_token", access);
            axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;

            // Schedule next refresh (55 minutes from now)
            const expiresIn = 55 * 60 * 1000; // 55 minutes in milliseconds
            refreshTimerRef.current = setTimeout(refreshAccessToken, expiresIn);

            return true;
        } catch (err) {
            console.error("Token refresh failed:", err);
            logout();
            return false;
        }
    }, [VITE_API_URL]);

    const initializeAuth = useCallback(async () => {
        const accessToken = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");

        if (!accessToken || !refreshToken) {
            setLoading(false);
            return;
        }

        try {
            // Verify token is still valid
            const payload = JSON.parse(atob(accessToken.split(".")[1]));
            const expiresAt = payload.exp * 1000;
            const now = Date.now();
            const expiresIn = expiresAt - now;

            if (expiresIn <= 0) {
                // Token expired, try to refresh
                const refreshed = await refreshAccessToken();
                if (!refreshed) {
                    setLoading(false);
                    return;
                }
            } else {
                // Token is valid, set auth state
                axios.defaults.headers.common[
                    "Authorization"
                ] = `Bearer ${accessToken}`;

                const username = localStorage.getItem("username");
                const adminStatus = localStorage.getItem("is_admin") === "true";

                setUser({
                    name: username || "User",
                    isAdmin: adminStatus,
                });
                setIsAdmin(adminStatus);
                setIsAuthenticated(true);

                // Schedule refresh 5 minutes before expiration
                const refreshIn = expiresIn - 5 * 60 * 1000;
                if (refreshIn > 0) {
                    refreshTimerRef.current = setTimeout(
                        refreshAccessToken,
                        refreshIn
                    );
                } else {
                    // If we're already within 5 minutes of expiration, refresh immediately
                    await refreshAccessToken();
                }
            }
        } catch (err) {
            console.error("Auth initialization error:", err);
            logout();
        } finally {
            setLoading(false);
        }
    }, [refreshAccessToken]);

    useEffect(() => {
        initializeAuth();

        return () => {
            clearRefreshTimer();
        };
    }, [initializeAuth, clearRefreshTimer]);

    const login = async (username, password) => {
        try {
            const response = await axios.post(`${VITE_API_URL}/login/`, {
                username,
                password,
            });

            // Store tokens and user data
            localStorage.setItem("access_token", response.data.access);
            localStorage.setItem("refresh_token", response.data.refresh);
            localStorage.setItem("username", username || "User");
            localStorage.setItem(
                "is_admin",
                response.data.is_admin ? "true" : "false"
            );

            // Set default auth header
            axios.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${response.data.access}`;

            // Update state
            setUser({
                name: username || "User",
                isAdmin: response.data.is_admin || false,
            });
            setIsAdmin(response.data.is_admin || false);
            setIsAuthenticated(true);

            // Calculate token expiration time (5 minutes before actual expiry)
            const expiresAt = response.data.access_expires * 1000;
            const now = Date.now();
            const expiresIn = expiresAt - now;
            const refreshIn = expiresIn - 5 * 60 * 1000; // Refresh 5 minutes before expiry

            if (refreshIn > 0) {
                refreshTimerRef.current = setTimeout(
                    refreshAccessToken,
                    refreshIn
                );
            } else {
                // If we're already within 5 minutes of expiration, refresh immediately
                await refreshAccessToken();
            }

            return {
                success: true,
                user: {
                    name: username,
                    isAdmin: response.data.is_admin,
                },
            };
        } catch (err) {
            logout();
            return {
                success: false,
                error:
                    err.response?.data?.detail ||
                    err.response?.data?.error ||
                    "Invalid credentials or server error",
            };
        }
    };

    const register = async (username, password) => {
        try {
            const response = await axios.post(`${VITE_API_URL}/register/`, {
                username,
                password,
            });

            if (response.status === 201) {
                return await login(username, password);
            }

            return { success: true };
        } catch (err) {
            return {
                success: false,
                error:
                    err.response?.data?.error ||
                    err.response?.data?.detail ||
                    "Registration failed. Please try again.",
            };
        }
    };

    const logout = useCallback(() => {
        clearRefreshTimer();
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        localStorage.removeItem("is_admin");
        delete axios.defaults.headers.common["Authorization"];
        setUser(null);
        setIsAdmin(false);
        setIsAuthenticated(false);
    }, [clearRefreshTimer]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isAdmin,
                loading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
