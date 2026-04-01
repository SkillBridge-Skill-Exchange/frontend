import React, { useState } from 'react';
import API from '../api';
import { Sparkles, Type, Layers, BarChart, Send } from 'lucide-react';

function AddSkill() {
  const [skill, setSkill] = useState({
    skill_name: '',
    category: '',
    type: 'offer',
    proficiency_level: 'beginner',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setSkill({ ...skill, [e.target.name]: e.target.value });
  };

  const handleTypeToggle = (type) => {
    setSkill({ ...skill, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/skills', skill);
      setSuccess('Skill listed successfully!');
      setSkill({ skill_name: '', category: '', type: 'offer', proficiency_level: 'beginner', description: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page add-skill-page">
      <div className="add-skill-card">
        {/* HEADER (IMAGE MATCH) */}
        <div className="add-skill-header">
          <div className="icon-capsule">
            <Sparkles size={24} />
          </div>
          <h1>Share Your Expertise</h1>
          <p>List your skills to help others or find collaborators for your projects.</p>
        </div>

        {success && <div style={{ color: 'green', textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* FORM GRID (IMAGE MATCH) */}
          <div className="form-grid">
            <div className="form-field">
              <label><Type size={16} /> SKILL NAME</label>
              <input 
                type="text" 
                name="skill_name" 
                placeholder="e.g. React Native, UI Design" 
                value={skill.skill_name} 
                onChange={handleChange} 
                className="input-premium"
                required 
              />
            </div>

            <div className="form-field">
              <label><Layers size={16} /> LISTING TYPE</label>
              <div className="type-toggle-group">
                <button 
                  type="button" 
                  className={`type-toggle-btn ${skill.type === 'offer' ? 'active' : ''}`}
                  onClick={() => handleTypeToggle('offer')}
                >
                  OFFERING
                </button>
                <button 
                  type="button" 
                  className={`type-toggle-btn ${skill.type === 'request' ? 'active' : ''}`}
                  onClick={() => handleTypeToggle('request')}
                >
                  REQUESTING
                </button>
              </div>
            </div>

            <div className="form-field">
              <label><Layers size={16} /> CATEGORY</label>
              <input 
                type="text" 
                name="category" 
                placeholder="e.g. Development, Art" 
                value={skill.category} 
                onChange={handleChange} 
                className="input-premium"
                required 
              />
            </div>

            <div className="form-field">
              <label><BarChart size={16} /> PROFICIENCY LEVEL</label>
              <select 
                name="proficiency_level" 
                value={skill.proficiency_level} 
                onChange={handleChange} 
                className="select-premium"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }} className="form-field">
            <label>DESCRIPTION & EXPERIENCE</label>
            <textarea 
              name="description" 
              placeholder="Tell other students what you can do or what you're looking for specifically..." 
              value={skill.description} 
              onChange={handleChange} 
              className="textarea-premium"
              rows={4}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-publish">
            <Send size={18} /> {loading ? 'Listing...' : 'Publish Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddSkill;
