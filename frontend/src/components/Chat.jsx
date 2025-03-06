import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Chat() {

  const VITE_API_URL = import.meta.env.VITE_API_URL;


  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
      const token = localStorage.getItem('access_token');
      if (!token) {
          navigate('/login');
      }
      }, [navigate]);

        
  const handleSend = async (e) => {
    e.preventDefault();

    setIsLoading(true);
  
    try {
      setError(null);
      const token = localStorage.getItem("access_token");

      const response = await axios.post(
        `${VITE_API_URL}/chat/`,
        { user_input: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setMessages([...messages, { user: input, chat: response.data.chat_response, timestamp: Date.now() }]);
      setInput("");
    } catch (err) {
      // if (err.response.status === 401) {
      //   setError({ message: "Unauthorized" });
      //   navigate("/login");
      // }
      // else if (err.response.status === 403) {
      //   setError({ message: "Forbidden" });
      //   navigate("/login");
      // }
      // else if (err.response.status === 500) {
      //   setError({ message: "Internal Server Error" });
      // }
      // else {
      //   setError(err.response.data);
      // }

      setError(err.response);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>
      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
        <div className="h-96 overflow-y-auto mb-4 border p-4 rounded bg-gray-50">
          {messages.map((msg, index) => (
            <div key={index} className="mb-4">
              <p className="text-left"><strong>{localStorage.getItem('username')}:</strong> <br />{msg.user}</p>
              <p className="text-right"><strong>Clork:</strong> <br />{msg.chat}</p>
              <p className="text-sm text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            </div>
          ))}

          {/* Show error message if there is an error */}
          {error && (
            <div className="mb-4">
              <p className="text-gray-500 italic">{error.data.error}</p>
              <p className="text-gray-500 italic">{error.statusText}</p>
            </div>
          )}
          {/* Show "Thinking..." while loading */}
          {isLoading && (
            <div className="mb-4">
              <p className="text-gray-500 italic">Thinking...</p>
            </div>
          )}

        </div>
        <form className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-2 border rounded-l"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            onClick={handleSend}
            className="bg-blue-600 text-white p-2 rounded-r hover:bg-blue-700 disabled:bg-blue-300"
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;