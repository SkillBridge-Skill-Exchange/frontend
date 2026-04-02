import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import SkillCard from '../components/SkillCard';
import { Search, Filter, Briefcase, HandHeart, UserCircle } from 'lucide-react';
import '../explore.css';

function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('offering');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    proficiency_level: '',
  });
  const { user } = useAuth();

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', proficiency_level: '' });
  };

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.proficiency_level) params.append('proficiency_level', filters.proficiency_level);

      const res = await API.get(`/skills?${params.toString()}`);
      const raw = Array.isArray(res.data.data) ? res.data.data : (res.data || []);
      setSkills(raw.map(s => ({ ...s, user: s.owner || s.user })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSkills();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [filters]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this skill from the portal?')) return;
    try {
      await API.delete(`/skills/${id}`);
      setSkills(skills.filter((s) => s.id !== id));
    } catch (err) {
      alert('Action unauthorized or server error.');
    }
  };

  return (
    <div className="page explore-page">
      <div className="explore-layout">
        
        {/* Sidebar Filters (IMAGE MATCH) */}
        <aside className="filters-sidebar">
          <div className="section-header">
            <Filter size={18} /> Filter Results
          </div>

          <div className="filter-group">
            <label>PROFICIENCY</label>
            <select name="proficiency_level" value={filters.proficiency_level} onChange={handleFilterChange}>
              <option value="">Any Proficiency</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div className="filter-group">
            <label>CATEGORY</label>
            <input 
              type="text" 
              name="category" 
              placeholder="e.g. Design, Coding" 
              value={filters.category} 
              onChange={handleFilterChange} 
            />
          </div>

          <button className="btn-clear" onClick={clearFilters}>Reset Filters</button>
        </aside>

        <main className="explore-main">
          <h1>Explore Talent</h1>
          <p>Discover opportunities to collaborate and grow together.</p>
          
          <div className="premium-search">
            <Search className="search-icon" size={24} color="#64748b" />
            <input
              type="text"
              name="search"
              placeholder="What skill are you looking for?"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          {loading ? (
             <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Gathering listings...</div>
          ) : (() => {
            const currentUserId = user?.id || user?._id;
            const mySkills = skills.filter(s => {
              const ownerId = s.user?.id || s.user?._id || s.owner?._id || s.user_id;
              return currentUserId && String(currentUserId) === String(ownerId);
            });
            const otherSkills = skills.filter(s => {
              const ownerId = s.user?.id || s.user?._id || s.owner?._id || s.user_id;
              return !currentUserId || String(currentUserId) !== String(ownerId);
            });
            const offeringSkills = otherSkills.filter(s => s.type === 'offer');
            const seekingSkills = otherSkills.filter(s => s.type === 'request');

            let displayedSkills = [];
            if (activeTab === 'offering') displayedSkills = offeringSkills;
            if (activeTab === 'seeking') displayedSkills = seekingSkills;
            if (activeTab === 'my_skills') displayedSkills = mySkills;

            return (
              <>
                <div className="explore-tabs-container">
                  <button 
                    className={`explore-tab ${activeTab === 'offering' ? 'active-offering' : ''}`}
                    onClick={() => setActiveTab('offering')}
                  >
                    <HandHeart size={18} /> Offering Help <span className="tab-count">{offeringSkills.length}</span>
                  </button>
                  <button 
                    className={`explore-tab ${activeTab === 'seeking' ? 'active-seeking' : ''}`}
                    onClick={() => setActiveTab('seeking')}
                  >
                    <Search size={18} /> Seeking Help <span className="tab-count">{seekingSkills.length}</span>
                  </button>
                  {user && (
                    <button 
                      className={`explore-tab ${activeTab === 'my_skills' ? 'active-mine' : ''}`}
                      onClick={() => setActiveTab('my_skills')}
                    >
                      <UserCircle size={18} /> My Listings <span className="tab-count">{mySkills.length}</span>
                    </button>
                  )}
                </div>
                
                <div className="skills-grid-premium">
                  {displayedSkills.map((skill) => (
                    <SkillCard 
                      key={skill.id} 
                      skill={skill} 
                      currentUser={user} 
                      onDelete={handleDelete} 
                    />
                  ))}
                  {displayedSkills.length === 0 && <div className="empty-box">No listings found in this category.</div>}
                </div>
              </>
            );
          })()}
        </main>
      </div>
    </div>
  );
}

export default Skills;
