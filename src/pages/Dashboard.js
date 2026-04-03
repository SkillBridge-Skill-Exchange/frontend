/**
 * Technical Campus Dashboard (AI-Powered)
 * =========================================
 * Real-data command centre with:
 *   • AI skill match % powered by Python cosine similarity engine
 *   • "People you may collaborate with" recommendations section
 *   • Live Demand Pulse chart
 *   • Top Experts leaderboard
 *   • Sync Agenda
 */

import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Users, MessageCircle, ArrowRight, Brain,
  CheckCircle, Clock, Send, Zap, Activity, Medal, Sparkle, Handshake,
  Calendar, MapPin, Layout, Search, Sparkles, Filter, Globe,
  Rocket, TrendingUp, UserPlus, Bot, Cpu, Network, ChevronRight, Star
} from 'lucide-react';
import '../dashboard.css';

// ─────────────────────────────────────────────
// Match % ring SVG
// ─────────────────────────────────────────────
function MatchRing({ pct, color }) {
  const r = 22, c = 28;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx={c} cy={c} r={r} fill="none" stroke="#f1f5f9" strokeWidth="5" />
      <circle
        cx={c} cy={c} r={r} fill="none"
        stroke={color} strokeWidth="5"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)' }}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fontSize="9" fontWeight="900" fill={color}>{pct}%</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Collaboration Card
// ─────────────────────────────────────────────
function CollabCard({ match, index }) {
  const { user, match_percentage, suggested_skills = [], collaboration_reason } = match;
  const pct = match_percentage;

  const getColor = (p) => {
    if (p >= 85) return '#10b981';
    if (p >= 70) return '#2b6777';
    if (p >= 50) return '#f59e0b';
    return '#94a3b8';
  };
  const color = getColor(pct);

  const avatarGradients = [
    'linear-gradient(135deg,#2b6777,#52ab98)',
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
    'linear-gradient(135deg,#10b981,#059669)',
    'linear-gradient(135deg,#ec4899,#db2777)',
  ];

  return (
    <div className="collab-card" style={{ animationDelay: `${index * 0.08}s` }}>
      {/* Top row: avatar + name + ring */}
      <div className="collab-card-header">
        <div className="collab-avatar" style={{ background: avatarGradients[index % avatarGradients.length] }}>
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div className="collab-user-info">
          <div className="collab-name">{user.name}</div>
          <div className="collab-dept">{user.department || user.college || 'Campus'}</div>
        </div>
        <MatchRing pct={pct} color={color} />
      </div>

      {/* Reason chip */}
      {collaboration_reason && (
        <div className="collab-reason">
          <Bot size={11} />
          <span>{collaboration_reason}</span>
        </div>
      )}

      {/* Skill pills */}
      {suggested_skills.length > 0 && (
        <div className="collab-skills">
          {suggested_skills.slice(0, 3).map((s, i) => (
            <span key={i} className="collab-skill-pill">{s}</span>
          ))}
        </div>
      )}

      {/* CTA row */}
      <div className="collab-cta">
        <Link to={`/profile/${user.id}`} className="collab-btn-view">
          View Profile <ChevronRight size={12} />
        </Link>
        <Link to="/messaging" className="collab-btn-msg">
          <MessageCircle size={13} />
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────
function Dashboard() {
  const [stats,       setStats]       = useState(null);
  const [matches,     setMatches]     = useState([]);
  const [agenda,      setAgenda]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (!token) { setLoading(false); return; }

    const fetchDashboard = async () => {
      console.log('[DASHBOARD] Syncing Nodes for:', user?.name);
      try {
        const statsRes = await API.get('/dashboard?t=' + Date.now());
        if (statsRes.data?.success) setStats(statsRes.data.data);
      } catch (e) { console.error('Stats Sync Error:', e); }

      try {
        const matchRes = await API.get('/matches?t=' + Date.now());
        if (matchRes.data?.success) setMatches(matchRes.data.data || []);
      } catch (e) { console.error('Match Sync Error:', e); }

      try {
        const reqRes = await API.get('/requests?t=' + Date.now());
        if (reqRes.data?.success) {
          const { sent = [], received = [] } = reqRes.data.data || {};
          setAgenda([...sent, ...received].filter(r => r.status !== 'completed').slice(0, 3));
        }
      } catch (e) { console.error('Agenda Sync Error:', e); }

      setErrorStatus(null);
      setLoading(false);
    };
    fetchDashboard();
  }, [user, token]);

  const getMatchColor = (pct) => {
    if (pct >= 85) return '#10b981';
    if (pct >= 70) return '#52ab98';
    if (pct >= 50) return '#f59e0b';
    return '#64748b';
  };

  if (loading) return (
    <div className="page" style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner-premium"></div>
      <p style={{ marginTop: '2rem', fontStyle: 'italic', opacity: 0.6 }}>Gathering real-time campus data nodes...</p>
    </div>
  );

  const topMatch = matches[0];
  const collabSuggestions = matches.slice(0, 6); // show up to 6

  return (
    <div className="page dashboard-page">

      {/* ── 1. TOP BENTO ROW ── */}
      <div className="bento-grid">
        {/* Welcome */}
        <div className="bento-card welcome-card">
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.7rem', fontWeight: 950, color: '#0d9488' }}>
              <Globe size={14} /> {user?.department?.toUpperCase() || 'GENERAL'} DIVISION
            </div>
            {stats?.debugVersion && (
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                {stats.debugVersion}
              </div>
            )}
          </div>
          <h1>Hello, {user?.name.split(' ')[0]}! {errorStatus && '!'}</h1>
          <p>
            {stats?.myStats?.mySkillsCount > 0
              ? `You are currently sharing ${stats.myStats.mySkillsCount} skills with the community.`
              : 'Start your journey by publishing your first technical skill to the campus network.'}
          </p>
          <div className="welcome-actions">
            <Link to="/skills"    className="btn-elite primary"    style={{ background: '#2b6777', color: 'white' }}>DISCOVER HUB <Search size={18} /></Link>
            <Link to="/requests"  className="btn-elite secondary"  style={{ borderColor: '#e2e8f0' }}><Handshake size={18} /> SYNC LOGS</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="bento-card insights-card">
          <div className="insight-item">
            <div className="insight-icon-v3" style={{ background: '#f0fdf9', color: '#0d9488' }}><Zap size={20} /></div>
            <div className="insight-data">
              <div className="value">{stats?.myStats?.mySkillsCount || 0}</div>
              <div className="label">Your Offers</div>
            </div>
          </div>
          <div className="insight-item">
            <div className="insight-icon-v3" style={{ background: '#eff6ff', color: '#2563eb' }}><Handshake size={20} /></div>
            <div className="insight-data">
              <div className="value">{stats?.myStats?.myRequestsCount || 0}</div>
              <div className="label">Ongoing Syncs</div>
            </div>
          </div>
          <div className="insight-item">
            <div className="insight-icon-v3" style={{ background: '#fffbeb', color: '#d97706' }}><TrendingUp size={20} /></div>
            <div className="insight-data">
              <div className="value">{stats?.demandChart?.length || 0}</div>
              <div className="label">Trending Tech</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. SYNC AGENDA + NEURAL MATCHES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Agenda */}
        <div className="bento-card">
          <div className="section-title-elite" style={{ marginBottom: '1.5rem' }}>
            SYNC AGENDA <Calendar size={18} color="#2b6777" />
          </div>
          <div className="agenda-list">
            {agenda.length === 0 ? (
              <div style={{ padding: '3rem 0', textAlign: 'center', opacity: 0.4, fontSize: '0.85rem' }}>
                No scheduled syncs found.
              </div>
            ) : (
              agenda.map((act, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', padding: '0.85rem', background: '#f8fafc', borderRadius: '16px' }}>
                  <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: act.status === 'accepted' ? '#10b981' : '#f59e0b' }}>
                    <Clock size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#1e293b' }}>{act.sender_name || act.skill_name}</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>{act.status?.toUpperCase()} • REAL-TIME DATA</div>
                  </div>
                  <Link to="/requests" style={{ color: '#2b6777' }}><ArrowRight size={14} /></Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Neural Matches (top 2 preview) */}
        <div className="bento-card" style={{ padding: '1.75rem' }}>
          <div className="section-title-elite" style={{ marginBottom: '1.5rem' }}>
            NEURAL MATCHES <Sparkles size={18} color="#8b5cf6" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {matches.slice(0, 2).map((m, i) => (
              <div key={i} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '24px', position: 'relative', border: '1px solid #f1f5f9' }}>
                <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', fontSize: '0.8rem', fontWeight: 950, color: getMatchColor(m.match_percentage) }}>{m.match_percentage}%</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="elite-avatar" style={{ width: '40px', height: '40px', fontSize: '1rem', background: `linear-gradient(135deg, ${getMatchColor(m.match_percentage)}, #1e293b)` }}>
                    {m.user.name?.[0]}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.user.name}</div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8' }}>{m.user.department || 'CAMPUS'}</div>
                  </div>
                </div>
                <div className="skill-pills-v2">
                  {m.suggested_skills.slice(0, 2).map((s, j) => (
                    <span key={j} className="skill-pill-v2" style={{ fontSize: '0.6rem', padding: '0.25rem 0.5rem' }}>{s.toUpperCase()}</span>
                  ))}
                </div>
              </div>
            ))}
            {matches.length === 0 && (
              <div style={{ gridColumn: 'span 2', padding: '2rem', textAlign: 'center', opacity: 0.4 }}>
                <Brain size={32} style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.8rem' }}>Expand your skills to unlock real-time matches.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. PEOPLE YOU MAY COLLABORATE WITH (AI Section) ── */}
      <div className="bento-card collab-section" style={{ marginBottom: '2.5rem' }}>
        {/* Section header */}
        <div className="collab-section-header">
          <div className="collab-title-group">
            <div className="collab-ai-badge">
              <Cpu size={13} />
              <span>AI-POWERED</span>
            </div>
            <h2 className="collab-title">People you may collaborate with</h2>
            <p className="collab-subtitle">
              Ranked by cosine similarity of your skill profiles · Updated in real-time
            </p>
          </div>
          <Link to="/collaborate" className="collab-see-all">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Cards grid */}
        {collabSuggestions.length === 0 ? (
          <div className="collab-empty">
            <div className="collab-empty-icon">
              <Network size={40} />
            </div>
            <h3>No matches yet</h3>
            <p>Add skills to your profile so we can find the best collaborators for you.</p>
            <Link to="/add-skill" className="btn-elite primary" style={{ background: '#2b6777', color: 'white', marginTop: '1rem', display: 'inline-flex' }}>
              <Zap size={16} /> Add Skills
            </Link>
          </div>
        ) : (
          <div className="collab-cards-grid">
            {collabSuggestions.map((match, i) => (
              <CollabCard key={match.user.id || i} match={match} index={i} />
            ))}
          </div>
        )}

        {/* Footer: AI engine note */}
        <div className="collab-engine-note">
          <Bot size={12} />
          <span>Scores computed by Python scikit-learn cosine similarity engine · Proficiency-weighted vectors</span>
        </div>
      </div>

      {/* ── 4. BOTTOM BENTO: Demand Pulse + Leaderboard ── */}
      <div className="bottom-bento" style={{ gap: '2rem' }}>
        {/* Live Demand Pulse */}
        <div className="bottom-card market-card" style={{ padding: '1.5rem' }}>
          <div className="section-title-elite" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>LIVE DEMAND PULSE <Activity size={18} color="#52ab98" /></div>
          <div className="chart-view-v3">
            {(!stats || !stats.demandChart || stats.demandChart.length === 0) ? (
              <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.4, fontSize: '0.8rem' }}>No technical activity detected.</div>
            ) : (
              stats.demandChart.map((item, index) => {
                const maxCount = stats.demandChart[0]?.count || 1;
                const pct = (item.count / maxCount) * 100;
                const colors = ['#2b6777', '#52ab98', '#3b82f6', '#db2777'];
                return (
                  <div className="elite-chart-row" key={index} style={{ marginBottom: '1rem' }}>
                    <div className="chart-header-v3">
                      <span style={{ fontSize: '0.75rem' }}>{item.skill_name}</span>
                      <span style={{ fontSize: '0.7rem', color: colors[index % colors.length] }}>{item.count} NODES</span>
                    </div>
                    <div className="chart-track-v3" style={{ height: '6px' }}>
                      <div className="chart-fill-v3" style={{ width: `${pct}%`, background: colors[index % colors.length], borderRadius: '10px' }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Elite Contributors */}
        <div className="bottom-card leaderboard-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div className="section-title-elite" style={{ marginBottom: 0, fontSize: '1.1rem' }}>TOP EXPERTS <Medal size={18} color="#f59e0b" /></div>
            <Link to="/leaderboard" className="see-all-link" style={{ fontSize: '0.7rem' }}>ALL RANKINGS</Link>
          </div>
          <div className="elite-ranking-list">
            {(!stats || !stats.leaderboard || stats.leaderboard.length === 0) ? (
              <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.4, fontSize: '0.8rem' }}>Analysing contributions...</div>
            ) : (
              stats.leaderboard.slice(0, 3).map((student, index) => (
                <div className="elite-ranker" key={student.id} style={{ padding: '0.65rem 0' }}>
                  <div className="elite-avatar" style={{ width: '34px', height: '34px', fontSize: '0.85rem', background: '#f8fafc', color: '#1e293b' }}>{student.name?.[0]}</div>
                  <div className="user-names">
                    <h4 style={{ fontSize: '0.85rem' }}>{student.name}</h4>
                    <p style={{ fontSize: '0.6rem' }}>{student.skillsCount} TECHNICAL OFFERS</p>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 950, color: '#10b981' }}>#{index + 1}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
