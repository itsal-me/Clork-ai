import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import Header from './components/Header';
import axios from 'axios';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is logged in on page load
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    if (accessToken && refreshToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setIsLoggedIn(true);
      startTokenRefreshTimer();
    }
  }
  , []);


  const VITE_API_URL = import.meta.env.VITE_API_URL;


  const refreshAccessToken = async () => {
    try {
      const response = await axios.post(`${VITE_API_URL}/token/refresh/`, {
        refresh: localStorage.getItem('refresh_token'),
      });
      const { access, access_expires } = response.data;
      localStorage.setItem('access_token', access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      setIsLoggedIn(true);

      startTokenRefreshTimer(access_expires * 1000); // Convert to milliseconds
    } catch (err) {
      console.error('Error refreshing token:', err);
      logout();
    }
  }

  
  // Function to start the token refresh timer
  const startTokenRefreshTimer = (expiresAt) => {
    if (!expiresAt) {
      // If no expiration time is provided, calculate it from the current access token
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) return;

      // Decode the access token to get the expiration time
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      console.log(payload);
      expiresAt = payload.exp * 1000; // Convert to milliseconds
    }
    
    
    // Calculate the time remaining before the token expires
    const now = Date.now();
    const timeRemaining = expiresAt - now;

    // Refresh the token 2 minutes before it expires
    const refreshTime = timeRemaining - 1 * 60 * 1000; // 1 minutes before expiry

    if (refreshTime > 0) {
      console.log(`Token will refresh in ${refreshTime / 1000} seconds`);
      setTimeout(refreshAccessToken, refreshTime);
    } else {
      // If the token is already expired, refresh it immediately
      refreshAccessToken();
    }
  };


  //logout
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    delete axios.defaults.headers.common['Authorization'];
    setIsLoggedIn(false);
  }



  return (
    <Router>
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/chat" /> : <Login setIsLoggedIn={setIsLoggedIn} startTokenRefreshTimer={startTokenRefreshTimer} />}
        />
        <Route
          path="/register"
          element={isLoggedIn ? <Navigate to="/chat" /> : <Register />}
        />
        <Route
          path="/chat"
          element={isLoggedIn ? <Chat /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={isLoggedIn ? "/chat" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;