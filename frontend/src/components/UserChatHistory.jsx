import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Copy, Check, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { marked } from "marked";

const UserChatHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/chat/history/`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setHistory(response.data.chat_history);
                setLoading(false);
            } catch (err) {
                setError(
                    err.response?.data?.error || "Failed to load chat history"
                );
                setLoading(false);
            }
        };

        fetchChatHistory();
    }, []);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-purple-600 mb-4"
            >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Chat
            </button>

            <h1 className="text-2xl font-bold mb-6">Your Chat History</h1>

            {history.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow border border-purple-200 text-center">
                    <p className="text-gray-600">No chat history found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white p-4 rounded-lg shadow border border-purple-200"
                        >
                            <div className="mb-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium text-purple-800">
                                        You:
                                    </h3>
                                    <button
                                        onClick={() =>
                                            copyToClipboard(
                                                item.user_input,
                                                `input-${item.id}`
                                            )
                                        }
                                        className="text-gray-500 hover:text-purple-600"
                                    >
                                        {copiedId === `input-${item.id}` ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                <p className="mt-1 text-gray-800">
                                    {item.user_input}
                                </p>
                            </div>

                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium text-purple-800">
                                        Response:
                                    </h3>
                                    <button
                                        onClick={() =>
                                            copyToClipboard(
                                                item.chat_response,
                                                `response-${item.id}`
                                            )
                                        }
                                        className="text-gray-500 hover:text-purple-600"
                                    >
                                        {copiedId === `response-${item.id}` ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                <div
                                    className="mt-1 text-gray-800"
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(
                                            marked(item.chat_response)
                                        ),
                                    }}
                                />
                            </div>

                            <p className="mt-3 text-xs text-gray-500">
                                {formatDate(item.timestamp)}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserChatHistory;
