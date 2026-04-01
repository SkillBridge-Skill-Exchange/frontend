import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Users, MessageCircle, Sparkles, BarChart3, Trophy } from 'lucide-react';

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
        setMatches(matchRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="page" style={{ color: '#fff' }}>Gathering student activity...</div>;

  return (
    <div className="page dashboard-page">
      {/* HERO (IMAGE MATCH) */}
      <div className="dashboard-hero">
        <h1>Welcome back, {user?.name}! <TrendingUp size={36} color="#52ab98" /></h1>
        <p>Track your student activity and discover what's trending on campus.</p>
      </div>

      {/* STATS GRID (2x2 IMAGE MATCH) */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <Users size={18} /> YOUR SKILLS
          </div>
          <div className="value">{stats?.myStats.mySkillsCount || 0}</div>
          <p>Total skills listed by you</p>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <MessageCircle size={18} /> REQUESTS
          </div>
          <div className="value">{stats?.myStats.myRequestsCount || 0}</div>
          <p>Help requests you've sent</p>
        </div>
      </div>

      {/* AI MATCH (IMAGE MATCH) */}
      <div className="match-suggestions">
        <div className="section-header">
          <Sparkles size={20} color="#52ab98" /> AI Match Suggestions
        </div>
        <p>Peers you should collaborate with based on your skills.</p>
        <div style={{ marginTop: '1rem', color: '#94a3b8' }}>
          {matches.length === 0 ? "No matches yet. Add more skills to get suggestions!" : "Scroll to see your top matches..."}
        </div>
      </div>

      {/* BOTTOM GRID (IMAGE MATCH) */}
      <div className="dashboard-content">
        <div className="dashboard-column">
          <div className="section-header">
            <BarChart3 size={20} color="#52ab98" style={{ fontWeight: 'bold' }} /> Most In-Demand Skills
          </div>
          <div style={{ marginTop: '2rem' }}>
            {stats?.demandChart.slice(0, 3).map((item, index) => (
              <div className="bar-row" key={index}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#64748b' }}>{item.skill_name}</div>
                <div className="bar-wrapper">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${(item.count / (stats.demandChart[0]?.count || 1)) * 100}%` }}
                  ></div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{item.count} peers</div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-column">
          <div className="section-header">
            <Trophy size={20} color="#52ab98" /> Top Contributors
          </div>
          <div style={{ marginTop: '2rem' }}>
            {stats?.leaderboard.slice(0, 3).map((student, index) => (
              <div key={student.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', fontWeight: '900', color: '#2b6777', fontSize: '1.1rem' }}>#{index + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', color: '#2b3a4a' }}>{student.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{student.college}</div>
                </div>
                <div style={{ background: '#f0fdf4', color: '#52ab98', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900' }}>
                  {student.skillsCount} Skills
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
