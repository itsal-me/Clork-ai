import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Login() {
    const { login } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const [shakeError, setShakeError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const result = await login(username, password);
        if (result.success && localStorage.getItem("is_admin") === "true") {
            navigate("/admin");
        } else if (
            result.success &&
            localStorage.getItem("is_admin") === "false"
        ) {
            navigate("/chat");
        } else {
            setError(result.error);
            setShakeError(true);
            setTimeout(() => setShakeError(false), 500);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row-reverse items-center justify-center bg-white">
            <div className="w-full lg:w-[480px] flex flex-col px-14 py-10 space-y-8 bg-transparent text-gray-800">
                <div>
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12">
                            <img src="/assets/clork-logo-black.png" alt="" />
                        </div>
                        <h1 className="mt-2 text-2xl font-bold text-gray-800">
                            Welcome to Clork
                        </h1>
                        <p className="mt-2 mb-2 text-gray-600">
                            Sign in to continue your conversation
                        </p>
                    </div>

                    {error && (
                        <div
                            className={`p-3 text-sm text-red-600 bg-red-50 rounded-md transition-all relative ${
                                shakeError ? "animate-shake" : ""
                            }`}
                        >
                            {error.detail || "Unknown error."}
                        </div>
                    )}

                    <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="username"
                                className="block font-medium text-gray-700"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none text-gray-800"
                                placeholder="alif0"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none text-gray-800"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full cursor-pointer flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-900 focus:outline-none disabled:opacity-50"
                            >
                                {isLoading ? "Signing in..." : "Sign in"}
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="font-medium text-neutral-700 hover:text-neutral-900"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            <div
                className="relative flex-1 h-screen animate-gradient bg-gradient-to-r from-orange-400 via-red-600 to-pink-400 bg-[size:200%_200%]
rounded-2xl"
            >
                <div className="flex justify-center items-center w-full h-full">
                    <h1 className="text-6xl text-white text-center">
                        Experience the power of AI conversations. Instant,
                        insightful, and always available!
                    </h1>
                </div>
            </div>
        </div>
    );
}

export default Login;
