"use client";

import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const accessToken = localStorage.getItem("access_token");
            const refreshToken = localStorage.getItem("refresh_token");
            if (accessToken && refreshToken) {
                axios.defaults.headers.common[
                    "Authorization"
                ] = `Bearer ${accessToken}`;
                setIsAuthenticated(true);
                setUser({ name: localStorage.getItem("username") || "User" });
                startTokenRefreshTimer();
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const VITE_API_URL = import.meta.env.VITE_API_URL;

    const refreshAccessToken = async () => {
        try {
            const response = await axios.post(
                `${VITE_API_URL}/token/refresh/`,
                {
                    refresh: localStorage.getItem("refresh_token"),
                }
            );
            const { access, access_expires } = response.data;
            localStorage.setItem("access_token", access);
            axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;
            setIsAuthenticated(true);

            startTokenRefreshTimer(access_expires * 1000); // Convert to milliseconds
        } catch (err) {
            console.error("Error refreshing token:", err);
            logout();
        }
    };

    const startTokenRefreshTimer = (expiresAt) => {
        if (!expiresAt) {
            const accessToken = localStorage.getItem("access_token");
            if (!accessToken) return;

            const payload = JSON.parse(atob(accessToken.split(".")[1]));
            expiresAt = payload.exp * 1000;
        }

        const now = Date.now();
        const expiresIn = expiresAt - now;
        setTimeout(refreshAccessToken, expiresIn - 10000); // Refresh 10 seconds before expiration
    };

    const login = async (username, password) => {
        try {
            const response = await axios.post(`${VITE_API_URL}/token/`, {
                username,
                password,
            });
            localStorage.setItem("access_token", response.data.access);
            localStorage.setItem("refresh_token", response.data.refresh);

            axios.defaults.headers.common[
                "Authorization"
            ] = `Bearer ${response.data.access}`;

            setIsAuthenticated(true);
            localStorage.setItem("username", username || "User");
            startTokenRefreshTimer(response.data.access_expires);
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err.response?.data || {
                    error: "An error occurred, Login failed",
                },
            };
        }
    };

    const register = async (username, password) => {
        try {
            await axios.post(`${VITE_API_URL}/register/`, {
                username,
                password,
            });

            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err.response?.data || {
                    error: "An error occurred, Registration failed",
                },
            };
        }
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        delete axios.defaults.headers.common["Authorization"];
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{ user, isAuthenticated, loading, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};
