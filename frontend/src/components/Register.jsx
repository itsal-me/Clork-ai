import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [shakeError, setShakeError] = useState(false);

    const { register } = useAuth();

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError({ error: "Passwords do not match" });
            setShakeError(true);
            setTimeout(() => setShakeError(false), 500);
            setIsLoading(false);
            return;
        }

        const result = await register(username, password);
        if (result.success) {
            navigate("/login");
        } else {
            setError(result.error);
            setShakeError(true);
            setTimeout(() => setShakeError(false), 500);
        }
        setIsLoading(false);
    };

    return (
        <div
            className="min-h-screen flex flex-col md:flex-row-reverse items-center justify-center bg-white
"
        >
            <div className="w-full lg:w-[480px] px-14 space-y-8 bg-transparent text-gray-800 flex flex-col py-6">
                <div>
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12">
                            <img src="/assets/clork-logo-black.png" alt="" />
                        </div>
                        <h1 className="mt-2 text-2xl font-bold text-gray-800">
                            Create your account
                        </h1>
                        <p className="mt-2 mb-2 text-gray-600">
                            Join Clork and start chatting
                        </p>
                    </div>

                    {error && (
                        <div
                            className={`p-3 text-sm text-red-600 bg-red-50 rounded-md relative transition-all ${
                                shakeError ? "animate-shake" : ""
                            }`}
                        >
                            {error.error || "Unknown error."}
                        </div>
                    )}

                    <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                        {/* <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-bg-neutral-900 focus:border-neutral-bg-neutral-900 text-gray-800"
              placeholder="Your name"
            />
          </div> */}

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
                            <label
                                htmlFor="confirmPassword"
                                className="block font-medium text-gray-700"
                            >
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none bg-white text-gray-800"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full cursor-pointer flex justify-center mt-2 py-2 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-900 focus:outline-none disabled:opacity-50"
                            >
                                {isLoading
                                    ? "Creating account..."
                                    : "Create account"}
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="font-medium text-neutral-700 hover:text-neutral-900"
                            >
                                Sign in
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
                        Your data is protected. We never share your information.
                    </h1>
                </div>
            </div>
        </div>
    );
}

export default Register;
