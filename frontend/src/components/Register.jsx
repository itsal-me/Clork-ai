import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {

  const VITE_API_URL = import.meta.env.VITE_API_URL;
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      await axios.post(`${VITE_API_URL}/register/`, {
        username,
        password,
      });
      navigate('/login'); // Redirect to login page after registration
    } catch (err) {
      setError(err.response.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Register</h1>

      {error && <p className="text-red-500 mb-4">{error.error}</p>}
      

      <form onSubmit={handleRegister} className="bg-white p-6 rounded shadow-md w-80">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-green-300"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Register'}
        </button>

        <div className="text-sm mt-2 mb-4">Already have an account? <a href="/login" className="text-blue-500">Login</a></div>
      </form>

      
    </div>
  );
}

export default Register;