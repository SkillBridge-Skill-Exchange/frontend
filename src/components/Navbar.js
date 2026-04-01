/**
 * Navbar Component
 * =================
 * Navigation bar with links that change based on auth state.
 */

import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  return (
    <div className="navbar">
      <h2>🔗 SkillBridge</h2>
      <nav>
        <Link to="/skills">Skills</Link>
        {user ? (
          <>
            <Link to="/add-skill">Add Skill</Link>
            <span style={{ marginLeft: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
              Hi, {user.name}
            </span>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </div>
  );
}

export default Navbar;
