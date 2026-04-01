/**
 * Add Skill Page
 * ================
 * Form to create a new skill via POST /api/skills.
 * Only accessible when logged in.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function AddSkill() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    skill_name: '',
    category: '',
    proficiency_level: 'beginner',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await API.post('/skills', form);
      setSuccess('Skill added successfully!');
      setTimeout(() => navigate('/skills'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add skill');
    }
  };

  return (
    <div className="page">
      <h2>Add a New Skill</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Skill Name *</label>
          <input
            type="text"
            name="skill_name"
            value={form.skill_name}
            onChange={handleChange}
            placeholder="e.g. JavaScript, Graphic Design"
            required
          />
        </div>
        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="e.g. Programming, Design, AI/ML"
          />
        </div>
        <div className="form-group">
          <label>Proficiency Level</label>
          <select name="proficiency_level" value={form.proficiency_level} onChange={handleChange}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your skill and what you can teach..."
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Add Skill
        </button>
      </form>
    </div>
  );
}

export default AddSkill;
