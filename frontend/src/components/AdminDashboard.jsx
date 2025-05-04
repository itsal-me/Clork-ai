import React, { useState, useEffect, use } from "react";
import { useAuth } from "../hooks/useAuth"; // Adjust path if needed

import axios from "axios";
import {
    Users,
    X,
    Activity,
    Loader2,
    MessageSquare,
    LogOut,
} from "lucide-react";

const AdminDashboard = () => {
    const { logout } = useAuth(); // Assuming you have a logout function in your AuthContext
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total_users: 0,
        active_today: 0,
        total_chats: 0,
    });

    console.log(stats); // Debugging line
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("access_token");

                // Make sure to set the Accept header to application/json
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                };

                const usersRes = await axios.get(
                    `${import.meta.env.VITE_API_URL}/users/`,
                    config
                );

                console.log("Users Response:", usersRes.data); // Debugging line
                const statsRes = await axios.get(
                    `${import.meta.env.VITE_API_URL}/stats/`,
                    config
                );

                console.log("Stats Response:", statsRes.data); // Debugging line

                // Check if response is HTML (indicating a problem)
                if (
                    typeof usersRes.data === "string" &&
                    usersRes.data.startsWith("<!DOCTYPE html>")
                ) {
                    throw new Error(
                        "Received HTML instead of JSON - check API endpoint"
                    );
                }

                setUsers(usersRes.data.users || []);
                setStats(
                    statsRes.data || {
                        total_users: 0,
                        active_today: 0,
                        total_chats: 0,
                    }
                );
                setLoading(false);
            } catch (err) {
                console.error("API Error:", err);
                setError(
                    err.response?.data?.error ||
                        err.message ||
                        "Failed to load data"
                );
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                const token = localStorage.getItem("access_token");
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                };

                await axios.delete(
                    `${import.meta.env.VITE_API_URL}/users/${userId}/`,
                    config
                );

                setUsers(users.filter((user) => user.id !== userId));
                setStats((prev) => ({
                    ...prev,
                    totalUsers: prev.totalUsers - 1,
                }));
            } catch (err) {
                setError(err.response?.data?.error || "Failed to delete user");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500">
                {error}
                <p className="mt-2 text-sm">
                    This might be due to:
                    <ul className="list-disc pl-5 mt-1">
                        <li>Incorrect API endpoint configuration</li>
                        <li>Authentication failure (check token)</li>
                        <li>Server-side rendering returning HTML</li>
                    </ul>
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
                <button
                    onClick={logout}
                    className="p-2 rounded-full hover:bg-purple-100 text-gray-700"
                >
                    <LogOut className="w-8 h-8 p-2 rounded-full border border-gray-700" />
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow border border-purple-200">
                    <div className="flex items-center">
                        <Users className="w-6 h-6 text-purple-600 mr-2" />
                        <h3 className="font-semibold">Total Users</h3>
                    </div>
                    <p className="text-2xl mt-2">{stats.total_users}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-purple-200">
                    <div className="flex items-center">
                        <Activity className="w-6 h-6 text-purple-600 mr-2" />
                        <h3 className="font-semibold">Active Today</h3>
                    </div>
                    <p className="text-2xl mt-2">{stats.active_today}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-purple-200">
                    <div className="flex items-center">
                        <MessageSquare className="w-6 h-6 text-purple-600 mr-2" />
                        <h3 className="font-semibold">Total Chats</h3>
                    </div>
                    <p className="text-2xl mt-2">{stats.total_chats}</p>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden border border-purple-200">
                <div className="p-4 border-b border-purple-200">
                    <h2 className="font-semibold text-lg">User Management</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-purple-200">
                        <thead className="bg-purple-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-purple-500 uppercase tracking-wider">
                                    Username
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-purple-500 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-purple-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-purple-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-purple-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="font-medium">
                                                {user.username}
                                            </span>
                                            {user.is_superuser && (
                                                <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                                    Admin
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(
                                            user.date_joined
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${
                                                user.is_active
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {user.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {!user.is_superuser && (
                                            <button
                                                onClick={() =>
                                                    handleDeleteUser(user.id)
                                                }
                                                className="text-red-600 hover:text-red-800 p-1"
                                                title="Delete user"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
