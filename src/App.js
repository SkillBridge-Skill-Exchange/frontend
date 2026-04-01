/**
 * App Component
 * ==============
 * Root component with React Router for page navigation.
 * Manages auth state via localStorage token.
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Skills from './pages/Skills';
import AddSkill from './pages/AddSkill';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  // Sync state with localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken) setToken(storedToken);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <Router>
      <div className="app">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route
            path="/login"
            element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/skills" />}
          />
          <Route
            path="/register"
            element={!token ? <Register onLogin={handleLogin} /> : <Navigate to="/skills" />}
          />
          <Route path="/skills" element={<Skills />} />
          <Route
            path="/add-skill"
            element={token ? <AddSkill /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to="/skills" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
