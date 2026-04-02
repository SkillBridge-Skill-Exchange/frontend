/**
 * Enhanced Navbar Component
 * ==========================
 * Navigation bar with notification bell count, new page links.
 * Task Owner: B Rahul (UI/UX, Notifications UI)
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, MessageSquare, PlusCircle, Bell, LogOut, 
  Search, Trophy, Handshake, Home 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnread();
    }
  }, [user, location.pathname]);

  const fetchUnread = async () => {
    try {
      const res = await API.get('/notifications');
      const data = res.data.data || [];
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (err) {
      setUnreadCount(0);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'nav-active' : '';

  // Don't show navbar on landing page
  if (location.pathname === '/landing') return null;

  return (
    <header className="navbar">
      <div className="navbar-content">
        <Link to={user ? '/dashboard' : '/landing'} className="brand" style={{ textDecoration: 'none' }}>
          <h2>SkillBridge</h2>
        </Link>
        <nav>
          {user ? (
            <>
              <Link to="/dashboard" className={`nav-link-with-icon ${isActive('/dashboard')}`}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <Link to="/skills" className={`nav-link-with-icon ${isActive('/skills')}`}>
                <Search size={18} />
                <span>Explore</span>
              </Link>
              <Link to="/requests" className={`nav-link-with-icon ${isActive('/requests')}`}>
                <Handshake size={18} />
                <span>Requests</span>
              </Link>
              <Link to="/messaging" className={`nav-link-with-icon ${isActive('/messaging')}`}>
                <MessageSquare size={18} />
                <span>Messages</span>
              </Link>
              <Link to="/leaderboard" className={`nav-link-with-icon ${isActive('/leaderboard')}`}>
                <Trophy size={18} />
                <span>Leaders</span>
              </Link>
              
              <div className="nav-actions">
                <Link to="/add-skill" className="add-btn">
                  <PlusCircle size={18} />
                  <span>Post</span>
                </Link>
                <Link to="/profile" className="profile-link">
                  <span className="avatar-sm">{user.name?.[0]?.toUpperCase()}</span>
                  <span>{user.name}</span>
                </Link>
                <Link to="/notifications" className="notif-bell-link">
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </Link>
                <button className="logout-btn" onClick={handleLogout}>
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/landing" className="nav-link-simple">Home</Link>
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
