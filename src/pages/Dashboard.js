/**
 * Enhanced Dashboard
 * ===================
 * Student activity dashboard with in-demand skills chart,
 * AI match suggestions with match %, and leaderboard preview.
 * Includes "Collaboration Radar" improvisation.
 */

import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, Users, MessageCircle, Sparkles, BarChart3, 
  Trophy, Award, Star, ArrowRight, Percent, Brain, 
  CheckCircle, Clock, Send, Zap, Activity, Medal, X
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
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [requests, setRequests] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!token) { setLoading(false); return; }

    const fetchDashboard = async () => {
      console.log('[DASHBOARD] Syncing Nodes for:', user?.name);
      try {
        const [statsRes, matchRes, reqRes] = await Promise.all([
          API.get('/dashboard'),
          API.get('/matches'),
          API.get('/requests')
        ]);
        setStats(statsRes.data.data);
        setMatches(matchRes.data.data || []);
        setRequests(reqRes.data.data || { sent: [], received: [] });
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user, token]);

  const getMatchColor = (pct) => {
    if (pct >= 85) return '#10b981';
    if (pct >= 70) return '#52ab98';
    if (pct >= 50) return '#f59e0b';
    return '#64748b';
  };

  if (loading) return <div className="page" style={{ color: '#94a3b8', textAlign: 'center', paddingTop: '8rem' }}><div className="spinner-premium" style={{margin:'0 auto'}}></div></div>;

  return (
    <div className="page dashboard-page">
      <div className="dashboard-hero">
        <h1>Welcome back, {user?.name}! <TrendingUp size={36} color="#52ab98" /></h1>
        <p>Track your student activity and discover what's trending on campus.</p>
      </div>

      <div className="stats-grid-4">
        <div className="stat-card-v2" onClick={() => { setSelectedStat('skills'); setShowDetailModal(true); }}>
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2b6777' }}><Users size={22} /></div>
          <div className="stat-data">
            <div className="stat-value-v2">{stats?.myStats.mySkillsCount || 0}</div>
            <div className="stat-label-v2">Your Skills</div>
          </div>
        </div>
        <div className="stat-card-v2" onClick={() => { setSelectedStat('requests'); setShowDetailModal(true); }}>
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#10b981' }}><Send size={22} /></div>
          <div className="stat-data">
            <div className="stat-value-v2">{stats?.myStats.myRequestsCount || 0}</div>
            <div className="stat-label-v2">Requests Sent</div>
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

      {/* COLLABORATION RADAR */}
      <div className="dash-section" style={{ background: 'linear-gradient(to right, #f8fafc, #ffffff)', padding: '2rem', borderRadius: '30px', border: '1px solid #f1f5f9', marginBottom: '2.5rem' }}>
        <div className="dash-section-header">
          <div className="section-header"><Zap size={22} color="#f59e0b" /> Collaboration Radar</div>
          <Link to="/requests" className="see-all-link">Manage All <ArrowRight size={16} /></Link>
        </div>
        <div className="radar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.25rem' }}>
           {[...requests.received, ...requests.sent].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3).map((r, idx) => {
             const isReceived = requests.received.find(req => req.id === r.id);
             const partner = isReceived ? r.requester : r.skill?.owner || r.skill?.user_id || r.skill?.user;
             return (
               <div key={idx} className="radar-item-v2" style={{ background: 'white', padding: '1.25rem', borderRadius: '18px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: isReceived ? '#2b6777' : '#52ab98', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>
                    {partner?.name?.[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>{partner?.name}</span>
                      <span className="status-badge" style={{ fontSize: '0.6rem', fontWeight: 900, background: r.status === 'accepted' ? '#d1fae5' : '#fef3c7', color: r.status === 'accepted' ? '#065f46' : '#92400e', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>{r.status}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{isReceived ? 'Wants' : 'Requested'} {r.skill?.skill_name}</div>
                  </div>
               </div>
             );
           })}
        </div>
      </div>

      {/* AI MATCHES */}
      <div className="dash-section">
        <div className="dash-section-header">
           <div className="section-header"><Brain size={22} color="#8b5cf6" /> AI suggestions</div>
           <Link to="/skills" className="see-all-link">Explore <ArrowRight size={16} /></Link>
        </div>
        <div className="match-cards-grid">
           {matches.slice(0, 4).map((m, i) => (
             <div key={i} className="match-card-v2">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                   <div className="match-avatar" style={{ background: getMatchColor(m.match_percentage) }}>{m.user.name?.[0]}</div>
                   <div>
                      <div className="match-name">{m.user.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{m.user.department} • {m.user.college}</div>
                   </div>
                   <div style={{ marginLeft: 'auto', fontWeight: 900, color: getMatchColor(m.match_percentage) }}>{m.match_percentage}%</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                   {m.suggested_skills.map((s, j) => <span key={j} className="match-skill-tag">{s}</span>)}
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* MODAL */}
      {showDetailModal && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
           <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                 <h2>{selectedStat === 'skills' ? 'Your Portfolio' : 'Sent Requests'}</h2>
                 <button onClick={() => setShowDetailModal(false)}><X /></button>
              </div>
              <div className="modal-body-v2">
                 {selectedStat === 'skills' ? stats?.myStats.mySkills?.map(s => <div key={s.id} className="radar-item-v2" style={{marginBottom: '1rem'}}>{s.skill_name}</div>) : stats?.myStats.myRequests?.map(r => <div key={r.id} className="radar-item-v2" style={{marginBottom: '1rem'}}>{r.skill?.skill_name} ({r.status})</div>)}
              </div>
           </div>
        </div>
      )}

      {/* BOTTOM GRID */}
      <div className="dashboard-content">
        <div className="dashboard-column">
           <div className="section-header"><BarChart3 size={20} color="#52ab98" /> In-Demand Skills</div>
           <div className="chart-container">
              {stats?.demandChart?.slice(0, 6).map((item, i) => (
                <div className="chart-bar-row" key={i}>
                   <div className="chart-label">{item.skill_name}</div>
                   <div className="chart-bar-wrapper"><div className="chart-bar-fill" style={{ width: `${(item.count/stats.demandChart[0].count)*100}%` }} /></div>
                   <div className="chart-count">{item.count}</div>
                </div>
              ))}
           </div>
        </div>
        <div className="dashboard-column">
           <div className="section-header"><Trophy size={20} color="#f59e0b" /> Top Contributors</div>
           {stats?.leaderboard?.slice(0, 5).map((s, i) => (
             <div key={i} className="lb-preview-row">
                <div style={{ fontWeight: 950, color: '#94a3b8', width: '20px' }}>#{i+1}</div>
                <div className="lb-user-avatar">{s.name?.[0]}</div>
                <div style={{ flex: 1 }}><div style={{fontWeight: 800}}>{s.name}</div><div style={{fontSize: '0.7rem', color: '#94a3b8'}}>{s.college}</div></div>
                <div style={{ fontWeight: 900, color: '#2b6777' }}>{s.skillsCount} skills</div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
