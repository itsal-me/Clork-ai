import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Login from "../components/Login";
import Register from "../components/Register";
import Chat from "../components/Chat";
import { Loader2 } from "lucide-react";

const AppRoutes = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />; // Prevents flickering on refresh
    }

    return (
        <Routes>
            {isAuthenticated ? (
                <>
                    <Route path="/chat" element={<Chat />} />
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
