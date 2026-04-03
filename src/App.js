/**
 * App Component
 * ========================
 * Root component with all routes, SocketProvider, and global CallOverlay.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CallOverlay from './components/CallOverlay';
import Login from './pages/Login';
import Register from './pages/Register';
import Skills from './pages/Skills';
import AddSkill from './pages/AddSkill';
import Dashboard from './pages/Dashboard';
import Messaging from './pages/Messaging';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import Notifications from './pages/Notifications';
import Requests from './pages/Requests';
import Leaderboard from './pages/Leaderboard';
import Students from './pages/Students';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function AppContent() {
  return (
    <Router>
      <SocketProvider>
        <div className="app">
          <Navbar />
          <CallOverlay />
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<PublicRoute><Landing initialModal="login" /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Landing initialModal="register" /></PublicRoute>} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/messaging" element={<ProtectedRoute><Messaging /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/add-skill" element={<ProtectedRoute><AddSkill /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/skills" element={<ProtectedRoute><Skills /></ProtectedRoute>} />
            <Route path="/collaborate" element={<ProtectedRoute><Students /></ProtectedRoute>} />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/landing" />} />
            <Route path="*" element={<Navigate to="/landing" />} />
          </Routes>
        </div>
      </SocketProvider>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
