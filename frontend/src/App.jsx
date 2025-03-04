import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import Header from './components/Header';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is logged in on page load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <Router>
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/chat" /> : <Login setIsLoggedIn={setIsLoggedIn} />}
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