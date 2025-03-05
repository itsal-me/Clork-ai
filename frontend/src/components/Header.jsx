import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Header({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token'); // Remove the token
    localStorage.removeItem('refresh_token'); // Remove the refresh token
    localStorage.removeItem('username'); // Remove the username
    delete axios.defaults.headers.common['Authorization']; // Remove the token from axios headers
    setIsLoggedIn(false); // Update login state
    navigate('/login'); // Redirect to login page
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className='flex items-center space-x-2'>
          <img className="w-[20px]" src="/assets/clork-rbg.png" alt="" />
          <h1 className="text-2xl font-bold">Clork</h1>
        </div>
        <nav>
          <ul className="flex space-x-4">
            {!isLoggedIn ? (
              <>
                <li>
                  <Link to="/login" className="hover:text-blue-200">Login</Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-blue-200">Register</Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/chat" className="hover:text-blue-200">Chat</Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="hover:text-blue-200">
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;