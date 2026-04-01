/**
 * Enhanced Dashboard
 * ===================
 * Student activity dashboard with in-demand skills chart,
 * AI match suggestions with match %, and leaderboard preview.
 * Task Owners: Y. Praneel Kumar Reddy (Dashboard, Chart)
 *              Regella Krishna Saketh (AI match % display)
 */

import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, Users, MessageCircle, Sparkles, BarChart3, 
  Trophy, Award, Star, ArrowRight, Percent, Brain, 
  CheckCircle, Clock, Send, Zap, Activity, Medal
} from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, matchRes] = await Promise.all([
          API.get('/dashboard'),
          API.get('/matches')
        ]);
        setStats(statsRes.data.data);
        setMatches(matchRes.data.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setStats({
          myStats: { mySkillsCount: 0, myRequestsCount: 0 },
          demandChart: [],
          leaderboard: []
        });
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getMatchColor = (pct) => {
    if (pct >= 85) return '#10b981';
    if (pct >= 70) return '#52ab98';
    if (pct >= 50) return '#f59e0b';
    return '#94a3b8';
  };

  if (loading) return <div className="page" style={{ color: '#94a3b8', textAlign: 'center', paddingTop: '8rem' }}>Gathering student activity...</div>;

  return (
    <div className="page dashboard-page">
      {/* HERO */}
      <div className="dashboard-hero">
        <h1>Welcome back, {user?.name}! <TrendingUp size={36} color="#52ab98" /></h1>
        <p>Track your student activity and discover what's trending on campus.</p>
      </div>

      {/* STATS GRID (4 cards) */}
      <div className="stats-grid-4">
        <div className="stat-card-v2">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2b6777' }}><Users size={22} /></div>
          <div className="stat-data">
            <div className="stat-value-v2">{stats?.myStats.mySkillsCount || 0}</div>
            <div className="stat-label-v2">Your Skills</div>
          </div>
        </div>
        <div className="stat-card-v2">
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#10b981' }}><Send size={22} /></div>
          <div className="stat-data">
            <div className="stat-value-v2">{stats?.myStats.myRequestsCount || 0}</div>
            <div className="stat-label-v2">Requests Sent</div>
          </div>
        </div>
        <div className="stat-card-v2">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}><Sparkles size={22} /></div>
          <div className="stat-data">
            <div className="stat-value-v2">{matches.length}</div>
            <div className="stat-label-v2">AI Matches</div>
          </div>
        </div>
        <div className="stat-card-v2">
          <div className="stat-icon" style={{ background: '#fce7f3', color: '#ec4899' }}><Activity size={22} /></div>
          <div className="stat-data">
            <div className="stat-value-v2">{matches.length > 0 ? `${matches[0].match_percentage}%` : '—'}</div>
            <div className="stat-label-v2">Best Match</div>
          </div>
        </div>
      </div>

      {/* AI MATCH SUGGESTIONS */}
      <div className="dash-section">
        <div className="dash-section-header">
          <div className="section-header">
            <Brain size={22} color="#8b5cf6" /> AI-Powered Match Suggestions
          </div>
          <Link to="/skills" className="see-all-link">View All <ArrowRight size={16} /></Link>
        </div>
        <div className="match-cards-grid">
          {matches.slice(0, 4).map((m, i) => (
            <div key={i} className="match-card-v2">
              <div className="match-card-top">
                <div className="match-avatar" style={{ background: getMatchColor(m.match_percentage) }}>
                  {m.user.name?.[0]}
                </div>
                <div className="match-user-info">
                  <div className="match-name">{m.user.name}</div>
                  <div className="match-college">{m.user.college} • {m.user.department}</div>
                </div>
                <div className="match-percentage" style={{ color: getMatchColor(m.match_percentage) }}>
                  <div className="match-pct-ring" style={{ '--pct-color': getMatchColor(m.match_percentage), '--pct': `${m.match_percentage}%` }}>
                    <svg viewBox="0 0 36 36" className="pct-svg">
                      <path className="pct-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="pct-fill" strokeDasharray={`${m.match_percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ stroke: getMatchColor(m.match_percentage) }} />
                    </svg>
                    <span className="pct-text">{m.match_percentage}%</span>
                  </div>
                </div>
              </div>
              <div className="match-skills-row">
                {m.suggested_skills.map((s, j) => (
                  <span key={j} className="match-skill-tag">{s}</span>
                ))}
              </div>
              <div className="match-card-actions">
                <button className="match-btn primary"><Send size={14} /> Request</button>
                <button className="match-btn secondary"><MessageCircle size={14} /> Chat</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM GRID: Chart + Leaderboard */}
      <div className="dashboard-content">
        {/* IN-DEMAND SKILLS CHART */}
        <div className="dashboard-column">
          <div className="section-header">
            <BarChart3 size={20} color="#52ab98" /> Most In-Demand Skills
          </div>
          <div className="chart-container">
            {stats?.demandChart?.slice(0, 6).map((item, index) => {
              const maxCount = stats.demandChart[0]?.count || 1;
              const pct = (item.count / maxCount) * 100;
              const colors = ['#2b6777', '#52ab98', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];
              return (
                <div className="chart-bar-row" key={index}>
                  <div className="chart-label">{item.skill_name}</div>
                  <div className="chart-bar-wrapper">
                    <div 
                      className="chart-bar-fill" 
                      style={{ 
                        width: `${pct}%`, 
                        background: `linear-gradient(90deg, ${colors[index % colors.length]}, ${colors[index % colors.length]}88)`,
                        animationDelay: `${index * 0.1}s`
                      }}
                    />
                  </div>
                  <div className="chart-count">{item.count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LEADERBOARD PREVIEW */}
        <div className="dashboard-column">
          <div className="dash-section-header" style={{ marginBottom: '1.5rem' }}>
            <div className="section-header">
              <Trophy size={20} color="#f59e0b" /> Top Contributors
            </div>
            <Link to="/leaderboard" className="see-all-link">View All <ArrowRight size={16} /></Link>
          </div>
          <div className="leaderboard-preview">
            {stats?.leaderboard?.slice(0, 5).map((student, index) => (
              <div key={student.id} className={`lb-preview-row ${index < 3 ? 'top-3' : ''}`}>
                <div className={`lb-rank ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}`}>
                  {index < 3 ? (
                    index === 0 ? <Trophy size={16} /> : <Medal size={16} />
                  ) : (
                    `#${index + 1}`
                  )}
                </div>
                <div className="lb-user-avatar">{student.name?.[0]}</div>
                <div className="lb-user-info">
                  <div className="lb-user-name">{student.name}</div>
                  <div className="lb-user-meta">{student.college}</div>
                </div>
                <div className="lb-score">
                  <Zap size={12} /> {student.skillsCount} skills
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
