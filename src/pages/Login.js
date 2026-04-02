import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn } from 'lucide-react';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/auth/login', formData);
      const { token, user } = res.data.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        {error && <div style={{ color: '#ef4444', marginBottom: '1.5rem', fontWeight: '800' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} className="premium-form">
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '900', color: '#a1a1aa', marginBottom: '0.75rem' }}>
              <Mail size={16} /> EMAIL
            </label>
            <input
              type="email"
              name="email"
              placeholder="e.g. name@student.com"
              value={formData.email}
              onChange={handleChange}
              className="input-premium"
              required
            />
          </div>
          
          <div style={{ textAlign: 'left', marginTop: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '900', color: '#a1a1aa', marginBottom: '0.75rem' }}>
              <Lock size={16} /> PASSWORD
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="input-premium"
              required
            />
          </div>

          <button type="submit" className="btn-publish-listing" style={{ margin: '2rem 0 0' }} disabled={loading}>
            <LogIn size={20} /> {loading ? 'Accessing...' : 'Login to SkillBridge'}
          </button>
        </form>
        
        <p>
          New to the community? <Link to="/register">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
