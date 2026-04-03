/**
 * Technical Campus Dashboard (Real Data Driven)
 * ============================================
 * A purely data-driven command center for campus skill-sharing.
 * NO Hardcoded dummy data. Refreshes based on real backend API states.
 */

import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Users, MessageCircle, ArrowRight, Brain, 
  CheckCircle, Clock, Send, Zap, Activity, Medal, Sparkle, Handshake,
  Calendar, MapPin, Layout, Search, Sparkles, Filter, Globe,
  Rocket, TrendingUp
} from 'lucide-react';
import '../dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    // Prevent fetching if no token is available or if we are already fetching
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      console.log('[DASHBOARD] Syncing Nodes for:', user?.name);
      try {
        const statsRes = await API.get('/dashboard?t=' + Date.now());
        if (statsRes.data?.success) {
          console.log('[DASHBOARD] Stats:', statsRes.data.data);
          setStats(statsRes.data.data);
        }
      } catch (e) { console.error('Stats Sync Error:', e); }

      try {
        const matchRes = await API.get('/matches?t=' + Date.now());
        if (matchRes.data?.success) {
          setMatches(matchRes.data.data || []);
        }
      } catch (e) { console.error('Match Sync Error:', e); }

      try {
        const requestsRes = await API.get('/requests?t=' + Date.now());
        if (requestsRes.data?.success) {
           const { sent = [], received = [] } = requestsRes.data.data || {};
           const all = [...sent, ...received];
           setAgenda(all.filter(r => r.status !== 'completed').slice(0, 3));
        }
      } catch (e) {
        console.error('Agenda Sync Error:', e);
      }

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

  return (
    <div className="page dashboard-page">
      {/* 1. TOP BENTO ROW */}
      <div className="bento-grid">
         {/* Welcome Bento */}
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
                 : "Start your journey by publishing your first technical skill to the campus network."}
            </p>
            <div className="welcome-actions">
               <Link to="/skills" className="btn-elite primary">DISCOVER HUB <Search size={18} /></Link>
               <Link to="/requests" className="btn-elite secondary"><Handshake size={18} /> SYNC LOGS</Link>
            </div>
         </div>

         {/* Stats Bento */}
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

      {/* 2. SYNC AGENDA & NEURAL MATCHES */}
      <div className="middle-bento">
         {/* Real Agenda */}
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
                    <div key={i} className="agenda-item-v3">
                       <div style={{ width: '36px', height: '36px', background: 'white', border: '1.5px solid #f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: act.status === 'accepted' ? '#10b981' : '#f59e0b', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                          <Clock size={16} />
                       </div>
                       <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#1e293b' }}>{act.sender_name || act.skill_name}</div>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700 }}>{act.status?.toUpperCase()} • REAL-TIME DATA</div>
                       </div>
                       <Link to="/requests" style={{ color: 'var(--primary)', opacity: 0.8 }}><ArrowRight size={14} /></Link>
                    </div>
                  ))
               )}
            </div>
         </div>

         {/* Neural Matches (Real Data) */}
         <div className="bento-card" style={{ padding: '1.75rem' }}>
            <div className="section-title-elite" style={{ marginBottom: '1.5rem' }}>
               NEURAL MATCHES <Sparkles size={18} color="#8b5cf6" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
               {matches.slice(0, 3).map((m, i) => (
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

      {/* 3. BOTTOM BENTO ROW (Real Charts & Ranks) */}
      <div className="bottom-bento">
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
