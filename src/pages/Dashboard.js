/**
 * Technical Campus Dashboard (Real Data Driven)
 * ============================================
 * A purely data-driven command center for campus skill-sharing.
 * NO Hardcoded dummy data. Refreshes based on real backend API states.
 *
 * Includes AI-powered "People you may collaborate with" section
 * that shows match percentages from the Python cosine similarity engine.
 */

import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Users, MessageCircle, ArrowRight, Brain, ChevronRight,
  CheckCircle, Clock, Send, Zap, Activity, Medal, Sparkle, Handshake,
  Calendar, MapPin, Layout, Search, Sparkles, Filter, Globe,
  Rocket, TrendingUp, X, Eye
} from 'lucide-react';
import '../dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
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
    if (pct >= 75) return '#059669'; // High potential
    if (pct >= 50) return '#ea580c'; // Moderate overlap
    return '#64748b'; // Basic parity
  };

  const getMatchGradient = (pct) => {
    if (pct >= 75) return 'linear-gradient(135deg, #059669, #10b981)';
    if (pct >= 50) return 'linear-gradient(135deg, #ea580c, #f97316)';
    return 'linear-gradient(135deg, #475569, #94a3b8)';
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
               <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.65rem', fontWeight: 950, color: '#3d8b7a' }}>
                  <Globe size={14} /> {user?.department?.toUpperCase() || 'GENERAL'} DIVISION
               </div>
               {stats?.debugVersion && (
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    {stats.debugVersion}
                  </div>
               )}
            </div>
            <h1>Hello, {user?.name?.split(' ')[0]}! {errorStatus && '!'}</h1>
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
            <div className="insight-item" onClick={() => { setSelectedStat('skills'); setShowDetailModal(true); }} style={{ cursor: 'pointer' }}>
               <div className="insight-icon-v3" style={{ background: '#e8f4f0', color: '#3d8b7a' }}><Zap size={18} /></div>
               <div className="insight-data">
                  <div className="value">{stats?.myStats?.mySkillsCount || 0}</div>
                  <div className="label">Your Offers</div>
               </div>
            </div>
            <div className="insight-item" onClick={() => { setSelectedStat('requests'); setShowDetailModal(true); }} style={{ cursor: 'pointer' }}>
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

         {/* LIVE ACTIVITY - NEW BENTO */}
         <div className="bento-card activity-card" style={{ gridColumn: 'span 2', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', border: '1.5px solid #bae6fd' }}>
            <div className="section-title-elite" style={{ color: '#10b981', background: '#ecfdf5', padding: '0.25rem 0.75rem', borderRadius: '6px', width: 'fit-content', border: 'none', marginBottom: '1.5rem' }}>
               QUICK TOOLKIT
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
               <Link to="/skills" className="activity-node">
                  <div className="node-val" style={{ color: '#0ea5e9' }}><Globe size={24} /></div>
                  <div className="node-lab" style={{ color: '#0369a1' }}>EXPLORE</div>
               </Link>
               <Link to="/collaborate" className="activity-node">
                  <div className="node-val" style={{ color: '#0d9488' }}><Handshake size={24} /></div>
                  <div className="node-lab" style={{ color: '#0f766e' }}>NETWORK</div>
               </Link>
               <Link to="/requests" className="activity-node">
                  <div className="node-val" style={{ color: '#f59e0b' }}><TrendingUp size={24} /></div>
                  <div className="node-lab" style={{ color: '#9a3412' }}>SYNC LOGS</div>
               </Link>
               <Link to="/messaging" className="activity-node">
                  <div className="node-val" style={{ color: '#8b5cf6' }}><MessageCircle size={24} /></div>
                  <div className="node-lab" style={{ color: '#7c3aed' }}>MESSAGES</div>
               </Link>
            </div>
            {/* Unified Footer */}
            <div className="pulse-indicator" style={{ borderTop: '1px solid #bae6fd', paddingTop: '1rem', marginTop: '1rem' }}>
               <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#0369a1', opacity: 0.8, letterSpacing: '0.1em' }}>SELECT A MODULE TO INITIATE SESSION</span>
            </div>
         </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
         PEOPLE YOU MAY COLLABORATE WITH — AI Recommendations
         ═══════════════════════════════════════════════════════════ */}
      <div className="bento-card collab-section" style={{ marginBottom: '2rem' }}>
        <div className="collab-section-header">
          <div className="collab-title-group">
            <h2 className="collab-title">People you may collaborate with</h2>
            <p className="collab-subtitle">
              Based on your skill profile, proficiency levels, and complementary request–offer matching
            </p>
          </div>
          <Link to="/collaborate" className="collab-see-all" style={{ padding: '0.6rem 1.25rem', borderRadius: '12px' }}>
            SEE ALL <ChevronRight size={14} />
          </Link>
        </div>



        {matches.length > 0 ? (
          <>
            <div className="collab-cards-grid">
              {matches.slice(0, 6).map((m, i) => (
                <div
                  key={m.user.id || i}
                  className="collab-card"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {/* Card Header — Avatar + Name + Match % */}
                  <div className="collab-card-header">
                    <div
                      className="collab-avatar"
                      style={{ background: getMatchGradient(m.match_percentage) }}
                    >
                      {m.user.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="collab-user-info">
                      <div className="collab-name">{m.user.name}</div>
                      <div className="collab-dept">{m.user.department || m.user.college || 'CAMPUS'}</div>
                    </div>
                    {/* Match Percentage Ring */}
                    <div className="collab-match-ring" style={{ '--match-color': getMatchColor(m.match_percentage) }}>
                      <svg viewBox="0 0 36 36" className="collab-ring-svg">
                        <path
                          className="collab-ring-bg"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="collab-ring-fill"
                          strokeDasharray={`${m.match_percentage}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          style={{ stroke: getMatchColor(m.match_percentage) }}
                        />
                      </svg>
                      <span className="collab-match-pct" style={{ color: getMatchColor(m.match_percentage) }}>
                        {m.match_percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Collaboration Reason */}
                  <div className="collab-reason">
                    <Brain size={12} />
                    {m.collaboration_reason}
                  </div>

                  {/* Skill Pills */}
                  <div className="collab-skills">
                    {m.suggested_skills.slice(0, 3).map((skill, j) => (
                      <span key={j} className="collab-skill-pill">{skill}</span>
                    ))}
                    {m.suggested_skills.length > 3 && (
                      <span className="collab-skill-pill" style={{ opacity: 0.5 }}>
                        +{m.suggested_skills.length - 3}
                      </span>
                    )}
                  </div>

                  {/* CTA buttons */}
                  <div className="collab-cta">
                    <Link to={`/profile/${m.user.id}`} className="collab-btn-view">
                      <Eye size={13} /> View Profile
                    </Link>
                    <Link to="/messaging" className="collab-btn-msg" title="Send Message">
                      <MessageCircle size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="collab-empty">
            <div className="collab-empty-icon">
              <Brain size={28} />
            </div>
            <h3>No Matches Yet</h3>
            <p>Add skills to your profile to discover AI-powered collaboration recommendations.</p>
            <Link to="/add-skill" className="btn-elite primary" style={{ marginTop: '0.75rem', fontSize: '0.75rem', padding: '0.6rem 1.2rem' }}>
              <Zap size={14} /> ADD YOUR FIRST SKILL
            </Link>
          </div>
        )}
      </div>

      {/* 3. BOTTOM BENTO ROW (Real Charts & Ranks) */}
      <div className="bottom-bento">
         {/* Live Demand Pulse */}
         <div className="bottom-card market-card" style={{ padding: '1.5rem' }}>
            <div className="section-title-elite" style={{ marginBottom: '1.25rem', fontSize: '0.95rem' }}>LIVE DEMAND PULSE <Activity size={16} color="#3d8b7a" /></div>
            <div className="chart-view-v3">
               {(!stats || !stats.demandChart || stats.demandChart.length === 0) ? (
                  <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.4, fontSize: '0.8rem' }}>No technical activity detected.</div>
               ) : (
                  stats.demandChart.map((item, index) => {
                     const maxCount = stats.demandChart[0]?.count || 1;
                     const pct = (item.count / maxCount) * 100;
                     const colors = ['#1b3a4b', '#3d8b7a', '#87ceeb', '#0f2b3c'];
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
               <div className="section-title-elite" style={{ marginBottom: 0, fontSize: '0.95rem' }}>TOP EXPERTS <Medal size={16} color="#f59e0b" /></div>
               <Link to="/leaderboard" className="see-all-link" style={{ fontSize: '0.7rem' }}>ALL RANKINGS</Link>
            </div>
            <div className="elite-ranking-list">
               {(!stats || !stats.leaderboard || stats.leaderboard.length === 0) ? (
                  <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.4, fontSize: '0.8rem' }}>Analysing contributions...</div>
               ) : (
                  stats.leaderboard.slice(0, 3).map((student, index) => (
                    <div className="elite-ranker" key={student.id} style={{ 
                      padding: '1rem', 
                      background: index === 0 ? '#fafaf9' : 'transparent',
                      borderRadius: '16px',
                      border: index === 0 ? '1px solid #f59e0b33' : 'none',
                      marginBottom: '0.4rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                       <div className="elite-avatar" style={{ 
                         width: '40px', 
                         height: '40px', 
                         fontSize: '1rem', 
                         background: index === 0 ? '#f59e0b' : '#f1f5f9', 
                         color: index === 0 ? 'white' : '#1e293b',
                         borderRadius: '12px',
                         boxShadow: index === 0 ? '0 4px 12px rgba(245, 158, 11, 0.2)' : 'none'
                       }}>
                          {student.name?.[0]}
                       </div>
                       <div className="user-names" style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1e293b' }}>{student.name}</h4>
                          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.02em', marginTop: '1px' }}>
                             {student.skillsCount} Technical {student.skillsCount === 1 ? 'Entry' : 'Offers'}
                          </p>
                       </div>
                       <div style={{ 
                         fontSize: '1.2rem', 
                         fontWeight: 950, 
                         color: index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : '#b45309',
                         opacity: 0.9,
                         fontFamily: 'DM Sans'
                       }}>
                          #{index + 1}
                       </div>
                    </div>
                  ))
               )}
            </div>
         </div>
      </div>

      {/* DETAIL MODAL FROM MAIN */}
      {showDetailModal && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
           <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                 <h2>{selectedStat === 'skills' ? 'Your Portfolio Nodes' : 'Collaborative Syncs'}</h2>
                 <button onClick={() => setShowDetailModal(false)} className="close-btn"><X /></button>
              </div>
              <div className="modal-body-v2" style={{ padding: '1.5rem 0' }}>
                 {selectedStat === 'skills' ? (
                   stats?.myStats.mySkills?.length > 0 ? (
                     stats.myStats.mySkills.map(s => <div key={s.id} className="agenda-item-v3" style={{ marginBottom: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={14} /></div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{s.skill_name}</div>
                     </div>)
                   ) : <div style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>No skills listed yet.</div>
                 ) : (
                   stats?.myStats.myRequests?.length > 0 ? (
                     stats.myStats.myRequests.map(r => <div key={r.id} className="agenda-item-v3" style={{ marginBottom: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: r.status === 'accepted' ? '#d1fae5' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Handshake size={14} /></div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{r.skill?.skill_name}</div>
                          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8' }}>Status: {r.status.toUpperCase()}</div>
                        </div>
                     </div>)
                   ) : <div style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>No active syncs found.</div>
                 )}
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                 <Link to={selectedStat === 'skills' ? '/skills' : '/requests'} className="btn-elite primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem' }}>
                   MANAGE FULL LIST <ChevronRight size={14} />
                 </Link>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
