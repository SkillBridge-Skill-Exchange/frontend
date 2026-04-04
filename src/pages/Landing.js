import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Users,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Zap,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';

function Landing({ initialModal = null }) {
  const [showModal, setShowModal] = useState(initialModal);
  const [authData, setAuthData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    department: '',
    year: '1st Year',
  });
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialModal) setShowModal(initialModal);
  }, [initialModal]);

  useEffect(() => {
    const fetchLandingData = async () => {
      setIsLoadingMetrics(true);
      try {
        const [usersRes, skillsRes] = await Promise.all([
          API.get('/users'),
          API.get('/skills'),
        ]);
        setAllUsers(usersRes.data?.data || []);
        setAllSkills(skillsRes.data?.data || []);
      } catch (err) {
        setAllUsers([]);
        setAllSkills([]);
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    fetchLandingData();
  }, []);

  const metrics = useMemo(() => {
    const departments = new Set(
      allUsers
        .map((u) => u.department)
        .filter(Boolean)
        .map((d) => d.trim().toLowerCase())
    );

    const skillsByCategory = allSkills.reduce((acc, skill) => {
      const key = (skill.category || 'Uncategorized').trim();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const topCategory = Object.entries(skillsByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'General';
    const offerCount = allSkills.filter((s) => s.type === 'offer').length;
    const requestCount = allSkills.filter((s) => s.type === 'request').length;

    return {
      studentsCount: allUsers.length,
      skillsCount: allSkills.length,
      departmentsCount: departments.size,
      topCategory,
      offerCount,
      requestCount,
    };
  }, [allUsers, allSkills]);

  const trendingSkills = useMemo(() => {
    const map = allSkills.reduce((acc, skill) => {
      const key = (skill.skill_name || 'Unknown').trim();
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [allSkills]);

  const latestStudents = useMemo(() => allUsers.slice(0, 6), [allUsers]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    try {
      if (showModal === 'login') {
        const res = await API.post('/auth/login', { email: authData.email, password: authData.password });
        login(res.data.data.token, res.data.data.user);
      } else {
        const res = await API.post('/auth/register', authData);
        login(res.data.data.token, res.data.data.user);
      }
      navigate('/dashboard');
    } catch (err) {
      const firstValidationError = err.response?.data?.errors?.[0]?.message;
      setAuthError(firstValidationError || err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="hero-left">
          <div className="hero-chip">
            <Sparkles size={14} /> Live Campus Data
          </div>
          <h1>
            SkillBridge
            <span>Real-time Collaboration Hub</span>
          </h1>
          <p>
            Find peers, list your skills, and build projects together. This landing page is powered by live data from
            your backend.
          </p>
          <div className="hero-actions">
            <button onClick={() => setShowModal('register')} className="btn-primary">
              Create Account <ArrowRight size={18} />
            </button>
            <button onClick={() => setShowModal('login')} className="btn-secondary">
              <Zap size={18} /> Sign In
            </button>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-card">
            <h3>Live Snapshot</h3>
            <ul>
              <li><Users size={16} /> Students: {isLoadingMetrics ? '...' : metrics.studentsCount}</li>
              <li><BookOpen size={16} /> Skills: {isLoadingMetrics ? '...' : metrics.skillsCount}</li>
              <li><Briefcase size={16} /> Top Category: {isLoadingMetrics ? '...' : metrics.topCategory}</li>
              <li><ShieldCheck size={16} /> Departments: {isLoadingMetrics ? '...' : metrics.departmentsCount}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-tile">
          <div className="k">{isLoadingMetrics ? '...' : metrics.studentsCount}</div>
          <div className="l">Students</div>
        </div>
        <div className="stat-tile">
          <div className="k">{isLoadingMetrics ? '...' : metrics.skillsCount}</div>
          <div className="l">Skills Listed</div>
        </div>
        <div className="stat-tile">
          <div className="k">{isLoadingMetrics ? '...' : metrics.offerCount}</div>
          <div className="l">Offering Skills</div>
        </div>
        <div className="stat-tile">
          <div className="k">{isLoadingMetrics ? '...' : metrics.requestCount}</div>
          <div className="l">Seeking Skills</div>
        </div>
      </section>

      <section className="live-section">
        <div className="panel">
          <h3><TrendingUp size={18} /> Trending Skills</h3>
          {trendingSkills.length === 0 ? (
            <p className="empty">No skills yet. Add skills to see trends.</p>
          ) : (
            <div className="skill-list">
              {trendingSkills.map((s) => (
                <div key={s.name} className="skill-row">
                  <span>{s.name}</span>
                  <strong>{s.count}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h3><Users size={18} /> New Students</h3>
          {latestStudents.length === 0 ? (
            <p className="empty">No users found yet.</p>
          ) : (
            <div className="user-grid">
              {latestStudents.map((u) => (
                <div key={u.id || u._id} className="user-card">
                  <div className="avatar">{u.name?.[0] || '?'}</div>
                  <div>
                    <div className="name">{u.name || 'Unknown'}</div>
                    <div className="meta">{u.department || 'Student'} · {u.college || 'Campus'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {showModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '540px', width: '100%' }}>
            <div className="modal-header">
              <h2>{showModal === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
              <button className="close-btn" onClick={() => { setShowModal(null); setAuthError(''); }}>✕</button>
            </div>
            {authError && (
              <div style={{ color: '#ef4444', marginBottom: '1.25rem', fontWeight: '800', textAlign: 'center', background: '#fef2f2', padding: '0.75rem', borderRadius: '12px' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {showModal === 'register' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-field"><label>FULL NAME</label><input type="text" value={authData.name} onChange={(e) => setAuthData({ ...authData, name: e.target.value })} className="input-premium" required /></div>
                    <div className="form-field"><label>STUDENT EMAIL</label><input type="email" value={authData.email} onChange={(e) => setAuthData({ ...authData, email: e.target.value })} className="input-premium" required /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-field"><label>COLLEGE / INSTITUTION</label><input type="text" value={authData.college} onChange={(e) => setAuthData({ ...authData, college: e.target.value })} className="input-premium" required /></div>
                    <div className="form-field"><label>DEPARTMENT</label><input type="text" value={authData.department} onChange={(e) => setAuthData({ ...authData, department: e.target.value })} className="input-premium" required /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-field">
                      <label>STUDENT YEAR</label>
                      <select name="year" value={authData.year} onChange={(e) => setAuthData({ ...authData, year: e.target.value })} className="input-premium" style={{ height: '48px', padding: '0 1rem' }}>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                    <div className="form-field"><label>CHOOSE PASSWORD</label><input type="password" value={authData.password} onChange={(e) => setAuthData({ ...authData, password: e.target.value })} className="input-premium" minLength={6} required /></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-field"><label>STUDENT EMAIL</label><input type="email" value={authData.email} onChange={(e) => setAuthData({ ...authData, email: e.target.value })} className="input-premium" required /></div>
                  <div className="form-field"><label>PASSWORD</label><input type="password" value={authData.password} onChange={(e) => setAuthData({ ...authData, password: e.target.value })} className="input-premium" minLength={6} required /></div>
                </>
              )}

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Accessing...' : showModal === 'login' ? 'Sign In' : 'Join Community'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;
