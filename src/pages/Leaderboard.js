/**
 * Leaderboard Page
 * =================
 * Top contributors with skill counts, endorsements, and activity scores.
 * Task Owner: Y. Praneel Kumar Reddy (Leaderboard)
 */

import React, { useState, useEffect } from 'react';
import API from '../api';
import { Trophy, Crown, Medal, Star, TrendingUp, Award, Users } from 'lucide-react';

function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeRange]);

  const fetchLeaderboard = async () => {
    try {
      const res = await API.get('/dashboard');
      const lb = res.data.data?.leaderboard || [];
      setLeaders(lb);
    } catch (err) {
      // Mock data for prototype
      setLeaders([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Crown size={24} style={{ color: '#f59e0b' }} />;
    if (index === 1) return <Medal size={24} style={{ color: '#94a3b8' }} />;
    if (index === 2) return <Medal size={24} style={{ color: '#cd7f32' }} />;
    return <span className="rank-num">#{index + 1}</span>;
  };

  const getRankClass = (index) => {
    if (index === 0) return 'gold';
    if (index === 1) return 'silver';
    if (index === 2) return 'bronze';
    return '';
  };

  if (loading) return <div className="page" style={{ textAlign: 'center', paddingTop: '8rem', color: '#94a3b8' }}>Loading leaderboard...</div>;

  return (
    <div className="page leaderboard-page">
      <div className="lb-header">
        <div>
          <h1><Trophy size={36} style={{ color: '#f59e0b' }} /> Top Contributors</h1>
          <p>Students making the biggest impact on campus skill exchange.</p>
        </div>
        <div className="lb-time-filter">
          {['all', 'month', 'week'].map(t => (
            <button 
              key={t} 
              className={`lb-time-btn ${timeRange === t ? 'active' : ''}`}
              onClick={() => setTimeRange(t)}
            >
              {t === 'all' ? 'All Time' : t === 'month' ? 'This Month' : 'This Week'}
            </button>
          ))}
        </div>
      </div>

      {/* TOP 3 PODIUM */}
      <div className="podium">
        {leaders.slice(0, 3).map((leader, i) => {
          const order = [1, 0, 2]; // silver, gold, bronze
          const idx = order[i];
          const l = leaders[idx];
          if (!l) return null;
          return (
            <div key={l.id} className={`podium-card ${getRankClass(idx)}`} style={{ order: i }}>
              <div className="podium-rank">{getRankIcon(idx)}</div>
              <div className="podium-avatar">{l.name?.[0]}</div>
              <div className="podium-name">{l.name}</div>
              <div className="podium-college">{l.college}</div>
              <div className="podium-stats">
                <div className="podium-stat">
                  <Award size={14} /> {l.skillsCount || l.skillsCount} Skills
                </div>
                <div className="podium-stat">
                  <Star size={14} /> {l.endorsements || 0} Endorsements
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FULL LIST */}
      <div className="lb-table">
        <div className="lb-table-header">
          <span className="lb-col rank">Rank</span>
          <span className="lb-col name">Student</span>
          <span className="lb-col">Department</span>
          <span className="lb-col">Skills</span>
          <span className="lb-col">Endorsements</span>
          <span className="lb-col">Rating</span>
        </div>
        {leaders.map((l, i) => (
          <div key={l.id} className={`lb-row ${getRankClass(i)}`}>
            <span className="lb-col rank">
              {getRankIcon(i)}
            </span>
            <span className="lb-col name">
              <div className="lb-avatar">{l.name?.[0]}</div>
              <div>
                <div className="lb-name-text">{l.name}</div>
                <div className="lb-college-text">{l.college}</div>
              </div>
            </span>
            <span className="lb-col">{l.department || 'CSE'}</span>
            <span className="lb-col">
              <span className="lb-pill skills">{l.skillsCount || 0}</span>
            </span>
            <span className="lb-col">
              <span className="lb-pill endorsements">{l.endorsements || 0}</span>
            </span>
            <span className="lb-col">
              <div className="lb-rating">
                <Star size={14} fill="#f59e0b" stroke="#f59e0b" />
                {l.avgRating || '—'}
              </div>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;
