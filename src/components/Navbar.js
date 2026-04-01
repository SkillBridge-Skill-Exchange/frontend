/**
 * Navbar Component
 * =================
 * Navigation bar with links that change based on auth state.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, PlusCircle, Bell, LogOut, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-content">
        <Link to="/dashboard" className="brand">
          <h2>SkillBridge</h2>
        </Link>
        <nav>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link-with-icon">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <Link to="/skills" className="nav-link-with-icon">
                <Search size={18} />
                <span>Explore</span>
              </Link>
              <Link to="/messaging" className="nav-link-with-icon">
                <MessageSquare size={18} />
                <span>Messages</span>
              </Link>
              
              <div className="nav-actions">
                <Link to="/add-skill" className="add-btn">
                  <PlusCircle size={18} />
                  <span>Post</span>
                </Link>
                <Link to="/profile" className="profile-link">
                  <span className="avatar-sm">{user.name?.[0].toUpperCase()}</span>
                  <span>{user.name}</span>
                </Link>
                <div className="notif-bell">
                  <Bell size={20} />
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/skills" className="nav-link-simple">Browse</Link>
              <Link to="/login" className="nav-link-simple">Login</Link>
              <Link to="/register" className="btn-join">Join Community</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
