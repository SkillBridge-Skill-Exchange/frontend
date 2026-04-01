import React, { useState, useEffect } from 'react';
import API from '../api';
import SkillCard from '../components/SkillCard';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, FilterX } from 'lucide-react';

function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    type: '',
    proficiency_level: '',
  });
  const { user } = useAuth();

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', type: '', proficiency_level: '' });
  };

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.type) params.append('type', filters.type);
      if (filters.proficiency_level) params.append('proficiency_level', filters.proficiency_level);

      const res = await API.get(`/skills?${params.toString()}`);
      setSkills(Array.isArray(res.data.data) ? res.data.data : (res.data || []));
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
            <label>LISTING TYPE</label>
            <select name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">All Listings</option>
              <option value="offer">Offering Help</option>
              <option value="request">Seeking Help</option>
            </select>
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

        {/* Main Content (IMAGE MATCH) */}
        <main className="explore-main">
          <h1>Explore Talent</h1>
          <p>Connect with {skills.length} brilliant student{skills.length !== 1 ? 's' : ''} across campus.</p>
          
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
          ) : (
            <div className="skills-grid-premium">
              {skills.map((skill) => (
                <SkillCard 
                  key={skill.id} 
                  skill={skill} 
                  currentUser={user} 
                  onDelete={handleDelete} 
                />
              ))}
              {skills.length === 0 && <div className="empty-box">No results matched your filtering criteria.</div>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Skills;
