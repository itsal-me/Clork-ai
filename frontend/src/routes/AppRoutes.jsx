import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Login from "../components/Login";
import Register from "../components/Register";
import Chat from "../components/Chat";
import AdminDashboard from "../components/AdminDashboard";
import UserChatHistory from "../components/UserChatHistory";
import { Loader2 } from "lucide-react";

const AppRoutes = () => {
    const { isAuthenticated, loading, isAdmin } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <Routes>
            {isAuthenticated ? (
                <>
                    {/* Main chat route for all users */}
                    <Route path="/chat" element={<Chat />} />

                    {/* User's own chat history */}
                    <Route path="/history" element={<UserChatHistory />} />

                    {/* Admin-only routes */}
                    {isAdmin && (
                        <Route path="/admin" element={<AdminDashboard />} />
                    )}

                    {/* Default redirects */}
                    <Route path="/" element={<Navigate to="/chat" replace />} />
                    <Route path="*" element={<Navigate to="/chat" replace />} />
                </>
            ) : (
                <>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="*"
                        element={<Navigate to="/login" replace />}
                    />
                </>
            )}
        </Routes>
    );
};

export default AppRoutes;
