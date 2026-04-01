import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, School, GraduationCap, Calendar, UserPlus } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', 
    college: '', department: '', year: '1st Year' 
  });
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
      const res = await API.post('/auth/register', formData);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <h2>Join the Community</h2>
        {error && <div style={{ color: '#ef4444', marginBottom: '1.5rem', fontWeight: '800' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="premium-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', textAlign: 'left' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', fontWeight: '950', color: '#a1a1aa', marginBottom: '0.6rem' }}>
                <User size={14} /> FULL NAME
              </label>
              <input type="text" name="name" placeholder="Harini N" value={formData.name} onChange={handleChange} className="input-premium" required />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', fontWeight: '950', color: '#a1a1aa', marginBottom: '0.6rem' }}>
                <Mail size={14} /> EMAIL
              </label>
              <input type="email" name="email" placeholder="name@student.com" value={formData.email} onChange={handleChange} className="input-premium" required />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', fontWeight: '950', color: '#a1a1aa', marginBottom: '0.6rem' }}>
                <School size={14} /> COLLEGE
              </label>
              <input type="text" name="college" placeholder="Amrita Vishwa..." value={formData.college} onChange={handleChange} className="input-premium" required />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', fontWeight: '950', color: '#a1a1aa', marginBottom: '0.6rem' }}>
                <GraduationCap size={14} /> DEPT.
              </label>
              <input type="text" name="department" placeholder="Engineering" value={formData.department} onChange={handleChange} className="input-premium" required />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', fontWeight: '950', color: '#a1a1aa', marginBottom: '0.6rem' }}>
                <Calendar size={14} /> YEAR
              </label>
              <select name="year" value={formData.year} onChange={handleChange} className="input-premium">
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', fontWeight: '950', color: '#a1a1aa', marginBottom: '0.6rem' }}>
                <Lock size={14} /> PASSWORD
              </label>
              <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} className="input-premium" required />
            </div>
          </div>

          <button type="submit" className="btn-publish-listing" style={{ margin: '2rem 0 0' }} disabled={loading}>
            <UserPlus size={20} /> {loading ? 'Enrolling...' : 'Create Student Account'}
          </button>
        </form>

        <p>Already a member? <Link to="/login">Sign In</Link></p>
      </div>
    </div>
  );
}

export default Register;
