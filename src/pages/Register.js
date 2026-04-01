/**
 * Register Page
 * ==============
 * Registration form that calls POST /api/auth/register.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

function Register({ onLogin }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await API.post('/auth/register', form);
      const { token, user } = res.data.data;
      onLogin(token, user);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min 6 characters"
            required
            minLength={6}
          />
        </div>
        <div className="form-group">
          <label>College</label>
          <input
            type="text"
            name="college"
            value={form.college}
            onChange={handleChange}
            placeholder="Your college name"
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Register
        </button>
      </form>
      <Link to="/login" className="toggle-link">
        Already have an account? Login
      </Link>
    </div>
  );
}

export default Register;
