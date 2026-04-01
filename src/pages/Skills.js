/**
 * Skills Page
 * ============
 * Lists all skills from GET /api/skills.
 * Allows authenticated users to delete their own skills.
 */

import React, { useState, useEffect } from 'react';
import API from '../api';

function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  const fetchSkills = async () => {
    try {
      const res = await API.get('/skills');
      setSkills(res.data.data);
    } catch (err) {
      setError('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await API.delete(`/skills/${id}`);
      setSkills(skills.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const getBadgeClass = (level) => {
    const map = {
      beginner: 'badge-beginner',
      intermediate: 'badge-intermediate',
      advanced: 'badge-advanced',
      expert: 'badge-expert',
    };
    return `badge ${map[level] || ''}`;
  };

  if (loading) return <div className="page"><p>Loading skills...</p></div>;

  return (
    <div className="page">
      <h2>All Skills ({skills.length})</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {skills.length === 0 ? (
        <p>No skills listed yet. Be the first to add one!</p>
      ) : (
        skills.map((skill) => (
          <div className="card" key={skill.id}>
            <h3>{skill.skill_name}</h3>
            <p>
              <span className={getBadgeClass(skill.proficiency_level)}>
                {skill.proficiency_level}
              </span>
              {skill.category && (
                <span style={{ color: '#888', fontSize: '0.85rem' }}>
                  {skill.category}
                </span>
              )}
            </p>
            {skill.description && <p>{skill.description}</p>}
            {skill.owner && (
              <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.5rem' }}>
                By <strong>{skill.owner.name}</strong>
                {skill.owner.college && ` • ${skill.owner.college}`}
              </p>
            )}
            {currentUser && skill.user_id === currentUser.id && (
              <button
                className="btn btn-danger"
                style={{ marginTop: '0.5rem', padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}
                onClick={() => handleDelete(skill.id)}
              >
                Delete
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Skills;
