import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Sparkles, Users, MessageCircle, TrendingUp, Award,
  Star, ArrowRight, Zap, Shield, BarChart3, Brain,
  BookOpen, Handshake, ChevronRight, Bell
} from 'lucide-react';

const features = [
  { icon: <Brain size={28} />, title: 'AI Skill Matching', desc: 'Cosine similarity engine finds your perfect collaborators instantly.' },
  { icon: <Users size={28} />, title: 'Peer Endorsements', desc: 'Build credibility through community validation of your skills.' },
  { icon: <MessageCircle size={28} />, title: 'In-App Chat', desc: 'Connect and discuss projects in real-time with matched students.' },
  { icon: <Award size={28} />, title: 'Skill Badges', desc: 'Earn Beginner, Intermediate, and Expert level badges.' },
  { icon: <BarChart3 size={28} />, title: 'Activity Dashboard', desc: 'Track in-demand skills and your contribution metrics.' },
  { icon: <Star size={28} />, title: 'Reviews & Ratings', desc: 'Rate collaborators and build a reputation after projects.' },
];

const stats = [
  { value: '500+', label: 'Active Students' },
  { value: '1,200+', label: 'Skills Listed' },
  { value: '350+', label: 'Collaborations' },
  { value: '95%', label: 'Match Accuracy' },
];

const offerExamples = [
  { name: 'Alice J.', skill: 'React & Next.js', badge: 'Expert', color: '#2b6777' }, // primary
  { name: 'Rahul S.', skill: 'UI/UX Design', badge: 'Advanced', color: '#52ab98' }, // accent
  { name: 'Meera P.', skill: 'Python ML', badge: 'Expert', color: '#1e4854' },     // dark primary
  { name: 'Dev K.', skill: 'Node.js APIs', badge: 'Intermediate', color: '#3f8576' }, // dark accent
];

const seekExamples = [
  { name: 'Bob M.', skill: 'App Development', badge: 'Beginner', color: '#2b6777' },
  { name: 'Sara T.', skill: 'Data Science', badge: 'Intermediate', color: '#52ab98' },
  { name: 'Arjun V.', skill: 'Cloud & DevOps', badge: 'Beginner', color: '#1e4854' },
  { name: 'Priya L.', skill: 'Blockchain', badge: 'Intermediate', color: '#3f8576' },
];

function SkillPreviewCard({ person, delay }) {
  return (
    <div className="landing-skill-card" style={{ animationDelay: `${delay}s` }}>
      <div className="lsc-avatar" style={{ background: person.color }}>{person.name[0]}</div>
      <div className="lsc-info">
        <div className="lsc-name">{person.name}</div>
        <div className="lsc-skill">{person.skill}</div>
      </div>
      <span className="lsc-badge">{person.badge}</span>
    </div>
  );
}

function Landing({ initialModal = null }) {
  const [activeOffering, setActiveOffering] = useState(0);
  const [activeSeeking, setActiveSeeking] = useState(0);
  
  const [dbStats, setDbStats] = useState({ users: '500+', skills: '1200+', collaborations: '350+' });
  const [dynamicOffers, setDynamicOffers] = useState(offerExamples);
  const [dynamicSeeks, setDynamicSeeks] = useState(seekExamples);

  // Auth Modal State
  const [showModal, setShowModal] = useState(initialModal); // 'login' or 'register'
  const [authData, setAuthData] = useState({ 
    name: '', email: '', password: '',
    college: '', department: '', year: '1st Year'
  });
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showMatch, showRequest } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [usersRes, skillsRes] = await Promise.all([
          API.get('/users?limit=10'),
          API.get('/skills?limit=10')
        ]);
        
        const allUsers = usersRes.data.data || [];
        const allSkills = skillsRes.data.data || [];
        
        if (allUsers.length > 0) {
          setDbStats(prev => ({ ...prev, users: `${allUsers.length}+` }));
          // Use real users as examples if available
          const realOffers = allUsers.slice(0, 4).map((u, i) => ({
            name: u.name,
            skill: u.department || 'Student',
            badge: 'Member',
            color: offerExamples[i % 4].color
          }));
          setDynamicOffers(realOffers);
        }
        
        if (allSkills.length > 0) {
          setDbStats(prev => ({ ...prev, skills: `${allSkills.length}+` }));
        }
      } catch (err) { console.error('Landing fetch error:', err); }
    };
    fetchLandingData();
  }, []);

  useEffect(() => {
    if (initialModal) setShowModal(initialModal);
  }, [initialModal]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveOffering(p => (p + 1) % dynamicOffers.length);
      setActiveSeeking(p => (p + 1) % dynamicSeeks.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [dynamicOffers, dynamicSeeks]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    try {
      if (showModal === 'login') {
        const res = await API.post('/auth/login', { email: authData.email, password: authData.password });
        login(res.data.data.token, res.data.data.user);
        navigate('/dashboard');
      } else {
        const res = await API.post('/auth/register', authData);
        login(res.data.data.token, res.data.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">

      {/* Demo Notification Button */}
      <button 
        className="demo-notif-trigger"
        onClick={() => {
          showMatch('Sarah M. matches your React skills at 94%');
          setTimeout(() => showRequest('Alex wants to collaborate on Python ML'), 2000);
        }}
        title="Click to see notification demo"
      >
        <Bell size={20} />
        <span>Try Notifications</span>
      </button>

      {/* ── HERO ────────────────────────────── */}
      <section className="landing-hero">
        <div className="hero-particles">
          {[...Array(6)].map((_, i) => <div key={i} className={`particle particle-${i + 1}`} />)}
        </div>
        <div className="hero-content">
          <div className="hero-badge"><Sparkles size={16} /> AI-Powered Skill Exchange</div>
          <h1>
            Bridge Your<br />
            <span className="gradient-text">Skill Gap</span> On Campus
          </h1>
          <p className="hero-subtitle">
            SkillBridge connects students who <strong>offer</strong> expertise with those who
            <strong> seek</strong> to learn — powered by AI matching and peer endorsements.
          </p>
          <div className="hero-actions">
            <button onClick={() => setShowModal('register')} className="btn-hero-primary">
              Get Started <ArrowRight size={20} />
            </button>
            <button onClick={() => setShowModal('login')} className="btn-hero-secondary">
              <Zap size={20} /> Sign In
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-card card-1">
            <div className="mini-avatar" style={{ background: '#52ab98' }}>A</div>
            <div><div style={{ fontWeight: 800, fontSize: '0.9rem' }}>React Expert</div><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>96% Match</div></div>
            <div className="match-ring" style={{ '--progress': '96%' }}><span>96%</span></div>
          </div>
          <div className="visual-card card-2">
            <div className="mini-avatar" style={{ background: '#2b6777' }}>S</div>
            <div><div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Python ML</div><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>89% Match</div></div>
            <div className="match-ring" style={{ '--progress': '89%' }}><span>89%</span></div>
          </div>
          <div className="visual-card card-3">
            <div className="mini-avatar" style={{ background: '#e67e22' }}>M</div>
            <div><div style={{ fontWeight: 800, fontSize: '0.9rem' }}>UI/UX Design</div><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>82% Match</div></div>
            <div className="match-ring" style={{ '--progress': '82%' }}><span>82%</span></div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────── */}
      <section className="stats-bar">
        <div className="stat-item">
          <div className="stat-value">{dbStats.users}</div>
          <div className="stat-label">Active Students</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{dbStats.skills}</div>
          <div className="stat-label">Skills Listed</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{dbStats.collaborations}</div>
          <div className="stat-label">Collaborations</div>
        </div>
      </section>

      {/* ── SKILL SPLIT SECTION ──────────────── */}
      <section className="skill-split-section">
        <div className="section-intro">
          <h2>Two Sides of Every <span className="gradient-text">Collaboration</span></h2>
          <p>Every great project needs students who can teach and students who want to learn.</p>
        </div>

        <div className="skill-split-grid">
          {/* Offering Panel */}
          <div className="skill-panel offering-panel">
            <div className="panel-header">
              <div className="panel-icon offering-icon"><Zap size={24} /></div>
              <div>
                <h3>Offering Skills</h3>
                <p>Students sharing their expertise</p>
              </div>
            </div>
            <div className="panel-cards">
              {dynamicOffers.map((p, i) => (
                <SkillPreviewCard key={i} person={p} delay={i * 0.1} />
              ))}
            </div>
            <div className="panel-footer">
              <button onClick={() => setShowModal('register')} className="panel-cta offering-cta">
                Share Your Skills <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* VS divider */}
          <div className="split-divider">
            <div className="divider-line"></div>
            <div className="vs-badge"><Handshake size={20} /></div>
            <div className="divider-line"></div>
          </div>

          {/* Seeking Panel */}
          <div className="skill-panel seeking-panel">
            <div className="panel-header">
              <div className="panel-icon seeking-icon"><BookOpen size={24} /></div>
              <div>
                <h3>Seeking Skills</h3>
                <p>Students looking to learn & grow</p>
              </div>
            </div>
            <div className="panel-cards">
              {dynamicSeeks.map((p, i) => (
                <SkillPreviewCard key={i} person={p} delay={i * 0.1} />
              ))}
            </div>
            <div className="panel-footer">
              <button onClick={() => setShowModal('register')} className="panel-cta seeking-cta">
                Find Your Mentor <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────── */}
      <section className="features-section">
        <div className="section-intro">
          <h2>Everything You Need to <span className="gradient-text">Collaborate</span></h2>
          <p>Powerful features designed to make campus skill exchange seamless and productive.</p>
        </div>

        {/* SKILL LEVEL BADGES SHOWCASE */}
        <div className="badges-showcase">
          <div className="badges-showcase-title">
            <Award size={24} style={{ color: '#52ab98' }} />
            <span>Skill Level System</span>
          </div>
          <div className="badges-row">
            <div className="badge-showcase-item beginner-showcase">
              <div className="badge-showcase-icon">
                <Star size={28} />
              </div>
              <div className="badge-showcase-label">Beginner</div>
              <div className="badge-showcase-desc">Just starting out</div>
            </div>
            <div className="badge-showcase-item intermediate-showcase">
              <div className="badge-showcase-icon">
                <Zap size={28} />
              </div>
              <div className="badge-showcase-label">Intermediate</div>
              <div className="badge-showcase-desc">Building expertise</div>
            </div>
            <div className="badge-showcase-item advanced-showcase">
              <div className="badge-showcase-icon">
                <Award size={28} />
              </div>
              <div className="badge-showcase-label">Advanced</div>
              <div className="badge-showcase-desc">Highly skilled</div>
            </div>
            <div className="badge-showcase-item expert-showcase">
              <div className="badge-showcase-icon">
                <Sparkles size={28} />
              </div>
              <div className="badge-showcase-label">Expert</div>
              <div className="badge-showcase-desc">Master level</div>
            </div>
          </div>
        </div>

        <div className="features-grid">
          {features.map((feat, i) => (
            <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon">{feat.icon}</div>
              <h3>{feat.title}</h3>
              <p>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────── */}
      <section className="how-section">
        <div className="section-intro">
          <h2>How <span className="gradient-text">SkillBridge</span> Works</h2>
          <p>Three simple steps to start collaborating with peers.</p>
        </div>
        <div className="steps-row">
          <div className="step-card">
            <div className="step-num">01</div>
            <h3>List Your Skills</h3>
            <p>Share what you're great at and what you want to learn. Set your proficiency level.</p>
          </div>
          <div className="step-connector"><ArrowRight size={24} /></div>
          <div className="step-card">
            <div className="step-num">02</div>
            <h3>Get AI Matches</h3>
            <p>Our cosine similarity engine analyzes skill vectors and suggests the best collaborators.</p>
          </div>
          <div className="step-connector"><ArrowRight size={24} /></div>
          <div className="step-card">
            <div className="step-num">03</div>
            <h3>Collaborate & Grow</h3>
            <p>Send requests, chat in real-time, work on projects, and rate each other after completion.</p>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section className="cta-section">
        <div className="cta-content">
          <Shield size={48} style={{ color: '#52ab98', marginBottom: '1rem' }} />
          <h2>Ready to Bridge the Skill Gap?</h2>
          <p>Join 500+ students already collaborating on campus. Your next great project starts here.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setShowModal('register')} className="btn-hero-primary" style={{ display: 'inline-flex' }}>
              Join SkillBridge <ArrowRight size={20} />
            </button>
            <button onClick={() => setShowModal('login')} className="btn-hero-secondary" style={{ display: 'inline-flex' }}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>SkillBridge</h3>
            <p>AI-powered campus skill exchange platform</p>
          </div>
          <div className="footer-links">
            <span>Created for SkillBridge Project</span>
          </div>
        </div>
      </footer>

      {/* ── AUTH MODAL (POPUP) ───────────────── */}
      {showModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '540px', width: '100%' }}>
            <div className="modal-header">
              <h2>{showModal === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
              <button className="close-btn" onClick={() => { setShowModal(null); setAuthError(''); }}><Award style={{ opacity: 0 }} /> ✕</button>
            </div>
            {authError && <div style={{ color: '#ef4444', marginBottom: '1.25rem', fontWeight: '800', textAlign: 'center', background: '#fef2f2', padding: '0.75rem', borderRadius: '12px' }}>{authError}</div>}
            
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {showModal === 'register' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-field">
                      <label>FULL NAME</label>
                      <input type="text" placeholder="Harini N" value={authData.name} onChange={e => setAuthData({...authData, name: e.target.value})} className="input-premium" required />
                    </div>
                    <div className="form-field">
                      <label>STUDENT EMAIL</label>
                      <input type="email" placeholder="name@student.edu" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} className="input-premium" required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-field">
                      <label>COLLEGE / INSTITUTION</label>
                      <input type="text" placeholder="Amrita Vishwa..." value={authData.college} onChange={e => setAuthData({...authData, college: e.target.value})} className="input-premium" required />
                    </div>
                    <div className="form-field">
                      <label>DEPARTMENT</label>
                      <input type="text" placeholder="Engineering" value={authData.department} onChange={e => setAuthData({...authData, department: e.target.value})} className="input-premium" required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-field">
                      <label>STUDENT YEAR</label>
                      <select name="year" value={authData.year} onChange={e => setAuthData({...authData, year: e.target.value})} className="input-premium" style={{ height: '48px', padding: '0 1rem' }}>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>CHOOSE PASSWORD</label>
                      <input type="password" placeholder="••••••••" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} className="input-premium" required />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-field">
                    <label>STUDENT EMAIL</label>
                    <input type="email" placeholder="name@student.edu" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} className="input-premium" required />
                  </div>
                  <div className="form-field">
                    <label>PASSWORD</label>
                    <input type="password" placeholder="••••••••" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} className="input-premium" required />
                  </div>
                </>
              )}

              <button type="submit" className="btn-hero-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', minHeight: '52px' }} disabled={loading}>
                {loading ? 'Accessing...' : (showModal === 'login' ? 'Sign In' : 'Join Community')}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
              {showModal === 'login' ? 'New to the community? ' : 'Already have an account? '}
              <span style={{ color: '#2b6777', cursor: 'pointer', fontWeight: 800 }} onClick={() => setShowModal(showModal === 'login' ? 'register' : 'login')}>
                {showModal === 'login' ? 'Create Account' : 'Sign In'}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Landing;
