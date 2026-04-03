import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import SkillCard from '../components/SkillCard';
import { Search, Filter, Briefcase, HandHeart, UserCircle, X, Check, Pencil, Plus, Award, Layers, Sliders, Trash2 } from 'lucide-react';

function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('offering');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    proficiency_level: '',
  });
  const popularCategories = ['Coding', 'Design', 'Marketing', 'Business', 'Art', 'Soft Skills'];
  const { user } = useAuth();
  
  // CRUD states for listings
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [skillForm, setSkillForm] = useState({
    skill_name: '',
    category: '',
    proficiency_level: 'beginner',
    description: '',
    type: 'offer'
  });

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
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [filters]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this skill from the portal?')) return;
    try {
      await API.delete(`/skills/${id}`);
      setSkills(skills.filter((s) => (s.id || s._id) !== id));
    } catch (err) {
      alert('Action unauthorized or server error.');
    }
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    setSkillForm({
      skill_name: skill.skill_name,
      category: skill.category || '',
      proficiency_level: skill.proficiency_level || 'beginner',
      description: skill.description || '',
      type: skill.type || 'offer'
    });
    setShowSkillModal(true);
  };

  const handleSkillSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSkill) {
        const id = editingSkill.id || editingSkill._id;
        const res = await API.put(`/skills/${id}`, skillForm);
        setSkills(skills.map(s => (s.id || s._id) === id ? { ...res.data.data, user: s.user } : s));
      }
      setShowSkillModal(false);
    } catch (err) {
      alert('Failed to update skill listing.');
    }
  };

  return (
    <div className="page explore-page">
      <div className="explore-layout">
        
        {/* Sidebar Filters (IMAGE MATCH) */}
        <aside className="filters-sidebar">
          <div className="section-header">
            <Sliders size={20} /> SYNC FILTERS
          </div>

          <div className="filter-group">
            <label><Award size={14} /> PROFICIENCY NODE</label>
            <div className="proficiency-pills">
              {['beginner', 'intermediate', 'advanced', 'expert'].map(lvl => (
                <button 
                  key={lvl}
                  onClick={() => setFilters({...filters, proficiency_level: filters.proficiency_level === lvl ? '' : lvl})}
                  className={`prof-pill ${filters.proficiency_level === lvl ? 'active' : ''}`}
                >
                  {lvl.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label><Layers size={14} /> DOMAIN CLOUD</label>
            <div className="category-cloud">
               {popularCategories.map(cat => (
                 <button 
                   key={cat}
                   onClick={() => setFilters({...filters, category: filters.category === cat ? '' : cat})}
                   className={`cloud-tag ${filters.category === cat ? 'active' : ''}`}
                 >
                   {cat}
                 </button>
               ))}
            </div>
            <input 
              type="text" 
              name="category" 
              placeholder="Or type specific domain..." 
              value={filters.category} 
              onChange={handleFilterChange} 
              style={{ marginTop: '0.8rem' }}
            />
          </div>

          <button className="btn-clear" onClick={clearFilters}>
            <Trash2 size={16} /> RESET PREFERENCES
          </button>
        </aside>

        <main className="explore-main">
          <h1>Explore Talent</h1>
          <p>Discover opportunities to collaborate and grow together.</p>
          
          <div className="premium-search">
            <Search className="search-icon" size={24} color="#64748b" />
            <input
              type="text"
              name="search"
              placeholder="Search by expertise or technology node..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          {(filters.category || filters.proficiency_level || filters.search) && (
            <div className="active-filters-row">
              {filters.search && (
                <span className="filter-chip">
                  Search: {filters.search} <X size={14} onClick={() => setFilters({...filters, search: ''})} />
                </span>
              )}
              {filters.category && (
                <span className="filter-chip">
                  Domain: {filters.category} <X size={14} onClick={() => setFilters({...filters, category: ''})} />
                </span>
              )}
              {filters.proficiency_level && (
                <span className="filter-chip">
                  Level: {filters.proficiency_level.toUpperCase()} <X size={14} onClick={() => setFilters({...filters, proficiency_level: ''})} />
                </span>
              )}
            </div>
          )}

          {loading ? (
             <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Gathering listings...</div>
          ) : (() => {
            const currentUserId = user?.id || user?._id;
            const getOwnerId = (s) => (s.owner?._id || s.owner?.id || s.user?._id || s.user?.id || s.user_id?._id || s.user_id);
            
            const mySkills = skills.filter(s => currentUserId && String(getOwnerId(s)) === String(currentUserId));
            
            // Show EVERY matched skill in the main tabs, but separate them in logic if needed
            const offeringSkills = skills.filter(s => s.type === 'offer');
            const seekingSkills = skills.filter(s => s.type === 'request');

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
                      className={`explore-tab ${activeTab === 'my_skills' ? 'active-mine' : ''} ${mySkills.length > 0 ? 'matching-node' : ''}`}
                      onClick={() => setActiveTab('my_skills')}
                    >
                      <UserCircle size={18} /> My Listings <span className="tab-count">{mySkills.length}</span>
                      {mySkills.length > 0 && <span className="neural-ping"></span>}
                    </button>
                  )}
                </div>
                
                <div style={{ marginBottom: '1.5rem', fontSize: '0.8rem', fontWeight: 950, color: '#94a3b8', letterSpacing: '0.05em' }}>
                  {skills.length} GLOBAL NODES SYNCHRONIZED ACROSS TOTAL CAMPUS
                </div>
                
                <div className="skills-grid-premium">
                  {displayedSkills.map((skill) => (
                    <SkillCard 
                      key={skill.id || skill._id} 
                      skill={skill} 
                      currentUser={user} 
                      onDelete={handleDelete} 
                      onEdit={handleEdit}
                    />
                  ))}
                  {displayedSkills.length === 0 && (
                    <div className="empty-box" style={{ width: '100%', gridColumn: 'span 3', padding: '5rem', background: 'rgba(255,255,255,0.5)' }}>
                       <Search size={40} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                       <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Node synchronization resulted in 0 matches for this category.</p>
                       <button className="btn-clear" onClick={clearFilters} style={{ width: 'fit-content', margin: '0 auto', padding: '1rem 2rem' }}>
                         <X size={18} /> DECOMMISSION ALL FILTERS
                       </button>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </main>
      </div>

      {showSkillModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Configure Listing</h2>
              <button className="close-btn" onClick={() => setShowSkillModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSkillSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-field">
                <label>SKILL NAME</label>
                <input 
                  type="text" 
                  value={skillForm.skill_name} 
                  onChange={e => setSkillForm({...skillForm, skill_name: e.target.value})} 
                  className="input-premium" 
                  required 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-field">
                  <label>DOMAIN</label>
                  <input 
                    type="text" 
                    value={skillForm.category} 
                    onChange={e => setSkillForm({...skillForm, category: e.target.value})} 
                    className="input-premium" 
                  />
                </div>
                <div className="form-field">
                  <label>LEVEL</label>
                  <select 
                    value={skillForm.proficiency_level} 
                    onChange={e => setSkillForm({...skillForm, proficiency_level: e.target.value})} 
                    className="select-premium"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label>TYPE</label>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  {['offer', 'request'].map(t => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 950, color: skillForm.type === t ? '#2b6777' : '#94a3b8', fontSize: '0.7rem' }}>
                      <input 
                        type="radio" 
                        name="type" 
                        value={t} 
                        checked={skillForm.type === t} 
                        onChange={e => setSkillForm({...skillForm, type: e.target.value})} 
                      />
                      {t === 'offer' ? <HandHeart size={14} /> : <Search size={14} />}
                      {t.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-publish" style={{ marginTop: '1rem' }}>
                <Check size={20} /> SYNC CHANGES
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Skills;
