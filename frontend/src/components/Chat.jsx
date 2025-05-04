import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import {
    Send,
    Settings,
    LogOut,
    Code2,
    BrainIcon,
    Sparkles,
    Loader2,
    Copy,
    Check,
} from "lucide-react";

import { marked } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

function Chat() {
    const VITE_API_URL = import.meta.env.VITE_API_URL;

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    const messagesEndRef = useRef(null);
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const suggestions = [
        {
            id: 1,
            icon: <BrainIcon className="w-5 h-5 text-purple-600" />,
            title: "Most Popular Philosophical Debate in History",
            subtitle: "Critical Thinking",
        },
        {
            id: 2,
            icon: <Code2 className="w-5 h-5 text-purple-600" />,
            title: "Make a Web Application with Django and React",
            subtitle: "Code Snippet Generator",
        },
        {
            id: 3,
            icon: <Sparkles className="w-5 h-5 text-purple-600" />,
            title: "UI/UX Design Trends 2025",
            subtitle: "Trending Now",
        },
    ];

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();

        if (!input.trim()) return;

        const userMessage = {
            id: Date.now(),
            user: input,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            setError(null);
            const token = localStorage.getItem("access_token");

            const response = await axios.post(
                `${VITE_API_URL}/chat/`,
                { user_input: input },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Configure Marked for Syntax Highlighting
            marked.setOptions({
                highlight: function (code, lang) {
                    return hljs.highlightAuto(code).value; // Auto-detect language
                },
                breaks: false, // Enable line breaks
                gfm: true, // GitHub Flavored Markdown
            });

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    chat: response.data.chat_response,
                    timestamp: Date.now(),
                },
            ]);
        } catch (err) {
            setError(
                err.response || {
                    data: {
                        error: "An error occurred. Please try again.",
                    },
                }
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setInput(suggestion.title);
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div
            className="flex flex-col h-screen animate-gradient bg-gradient-to-r from-orange-100 via-red-50 to-pink-100 bg-[size:200%_200%]
"
        >
            {/* Header */}

            <header className="flex items-center justify-between p-2 border-b border-purple-200">
                <div className="flex items-center space-x-2">
                    <div className="p-2">
                        <img
                            src="/assets/clork-logo.png"
                            alt="Clork"
                            className="w-8 h-8"
                        />
                    </div>
                    <span className="font-semibold text-gray-800">Clork</span>
                </div>
                <button
                    onClick={logout}
                    className="p-2 rounded-full hover:bg-purple-100 text-gray-700"
                >
                    <LogOut className="w-8 h-8 p-2 rounded-full border border-gray-700" />
                </button>
            </header>

            {/* Chat container */}
            <div className="flex-1 overflow-y-auto p-4 max-sm:p-1">
                {messages.length === 0 ? (
                    <div className="w-[calc(100%-60px)] max-sm:w-[calc(100%-30px)] mx-auto h-[calc(100%*2)]] flex flex-col items-center justify-center text-center">
                        <div className="p-4 mb-4">
                            <img
                                src="/assets/clork-logo.png"
                                alt="Clork"
                                className="w-12 h-12"
                            />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                            Hi, {localStorage.getItem("username") || "there"}
                        </h2>
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">
                            Can I help you with anything?
                        </h3>
                        <p className="text-gray-600 max-w-md mb-12">
                            Ready to assist you with anything you need, from
                            answering questions to providing recommendations.
                            Let's get started!
                        </p>

                        {/* Suggestion cards */}
                        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                            {suggestions.map((suggestion) => (
                                <button
                                    key={suggestion.id}
                                    onClick={() =>
                                        handleSuggestionClick(suggestion)
                                    }
                                    className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left border border-purple-200 hover:border-purple-400"
                                >
                                    <div className="bg-purple-100 rounded-full p-2 inline-block mb-2">
                                        {suggestion.icon}
                                    </div>
                                    <h4 className="font-medium text-gray-800">
                                        {suggestion.title}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        {suggestion.subtitle}
                                    </p>
                                </button>
                            ))}
                        </div> */}
                    </div>
                ) : (
                    <div className="space-y-4 w-[calc(100%-60px)] max-sm:w-[calc(100%-30px)] mx-auto">
                        {messages.map((message) => (
                            <div key={message.id} className="flex flex-col">
                                {message.user ? (
                                    <div className="flex justify-end mb-2">
                                        <div className="bg-purple-600 text-white p-3 rounded-lg rounded-tr-none max-w-[80%]">
                                            <p>{message.user}</p>
                                            <div className="text-xs text-purple-100 mt-1 text-right">
                                                {formatTimestamp(
                                                    message.timestamp
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex mb-2">
                                        <div className="bg-white text-gray-800 p-3 rounded-lg rounded-tl-none max-w-[97%] max-sm:max-w-[100%] shadow-sm relative group border border-purple-200">
                                            <div
                                                className="whitespace-pre-wrap"
                                                dangerouslySetInnerHTML={{
                                                    __html: DOMPurify.sanitize(
                                                        marked(message.chat)
                                                    ),
                                                }}
                                            ></div>

                                            {/* <p className="whitespace-pre-wrap">
                                                {message.chat}
                                            </p> */}
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            message.chat,
                                                            message.id
                                                        )
                                                    }
                                                    className="p-1 rounded hover:bg-purple-100"
                                                >
                                                    {copiedId === message.id ? (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-4 h-4 text-gray-500" />
                                                    )}
                                                </button>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {formatTimestamp(
                                                    message.timestamp
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex mb-2">
                                <div className="bg-white text-gray-800 p-3 rounded-lg rounded-tl-none max-w-[80%] shadow-sm border border-purple-200">
                                    <div className="flex items-center space-x-2">
                                        <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                                        <p className="text-gray-600">
                                            Thinking...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="flex mb-2">
                                <div className="bg-red-50 p-3 rounded-lg max-w-[80%] border border-red-200">
                                    <p className="text-gray-600">
                                        {error.data.error ||
                                            "Unknown error. Try to login again."}
                                    </p>
                                    <p className="text-gray-600">
                                        {error.statusText}
                                    </p>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input area */}
            <div className="w-[calc(100%-20px)] lg:w-[calc(100%-80px)] mx-auto rounded-xl mb-6 shadow-lg p-4 border-t border-purple-200 bg-white">
                <form
                    onSubmit={handleSend}
                    className="flex items-center space-x-2"
                >
                    <button
                        type="button"
                        className="p-2 rounded-full hover:bg-purple-100 text-gray-600"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask Clork anything..."
                            className="w-full p-3 rounded-full border border-purple-300 focus:outline-none bg-white text-gray-800 placeholder-gray-500"
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className={`p-2 rounded-lg ${
                            input.trim()
                                ? "bg-purple-500 hover:bg-purple-600"
                                : "bg-gray-300"
                        } text-white transition-colors`}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>

            <p className="text-sm text-gray-600 text-center mb-2">
                Deepseek R1 Model Powered
            </p>
        </div>
    );
}

export default Chat;
