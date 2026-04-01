/**
 * Enhanced SkillCard Component
 * ==============================
 * Includes skill level badges (Beginner/Intermediate/Expert),
 * collaboration request button, and endorsement count.
 * Task Owners: B Rahul (Skill level badges), Harini N (Skill listing)
 */

import React, { useState } from 'react';
import { User, Trash2, Send, ThumbsUp, Award, Star, Zap, Layers } from 'lucide-react';
import API from '../api';

const badgeConfig = {
  beginner: { label: 'Beginner', color: '#3b82f6', bg: '#eff6ff', icon: <Star size={12} /> },
  intermediate: { label: 'Intermediate', color: '#f59e0b', bg: '#fef3c7', icon: <Zap size={12} /> },
  advanced: { label: 'Advanced', color: '#8b5cf6', bg: '#f3e8ff', icon: <Award size={12} /> },
  expert: { label: 'Expert', color: '#ef4444', bg: '#fee2e2', icon: <Layers size={12} /> },
};

function SkillCard({ skill, currentUser, onDelete }) {
  const isOwnSkill = currentUser && currentUser.id === skill.user_id;
  const level = badgeConfig[skill.proficiency_level] || badgeConfig.beginner;
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [endorsing, setEndorsing] = useState(false);
  const [endorsed, setEndorsed] = useState(false);

  const handleRequest = async () => {
    setRequesting(true);
    try {
      await API.post('/requests', { 
        skill_id: skill.id, 
        message: `I'd like to collaborate on ${skill.skill_name}!` 
      });
      setRequested(true);
    } catch (err) {
      setRequested(true); // optimistic for prototype
    }
    setRequesting(false);
  };

  const handleEndorse = async () => {
    setEndorsing(true);
    try {
      await API.post('/endorsements', { 
        skill_id: skill.id, 
        comment: `Great ${skill.skill_name} skills!` 
      });
      setEndorsed(true);
    } catch (err) {
      setEndorsed(true); // optimistic for prototype
    }
    setEndorsing(false);
  };

  return (
    <div className="skill-card">
      {/* CARD TOP */}
      <div className="card-top">
        <span className={`type-tag ${skill.type === 'offer' ? 'type-offer' : 'type-request'}`}>
          {skill.type === 'offer' ? '🎯 OFFERING' : '🔍 SEEKING'}
        </span>
        <span className="category-tag">{(skill.category || 'General').substring(0, 12).toUpperCase()}</span>
      </div>

      {/* CARD BODY */}
      <div className="card-body">
        <h3>{skill.skill_name}</h3>
        
        {/* SKILL LEVEL BADGE */}
        <div className="skill-badge" style={{ background: level.bg, color: level.color }}>
          {level.icon} {level.label}
        </div>

        {skill.description && (
          <p className="skill-description">{skill.description}</p>
        )}
      </div>

      {/* CARD FOOTER */}
      <div className="card-footer">
        <div className="user-info-sm">
          <div className="avatar-xs">
            {skill.user?.name?.[0]?.toUpperCase() || skill.owner?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="user-meta">
            <span className="name">{skill.user?.name || skill.owner?.name || 'Student'}</span>
            <span className="year">Student • {skill.user?.year || skill.owner?.year || 'Unknown'}</span>
          </div>
        </div>
        
        <div className="card-actions-row">
          {!isOwnSkill && currentUser && (
            <>
              <button 
                className={`card-action-btn endorse ${endorsed ? 'done' : ''}`}
                onClick={handleEndorse}
                disabled={endorsing || endorsed}
                title="Endorse this skill"
              >
                <ThumbsUp size={14} />
              </button>
              <button 
                className={`card-action-btn request ${requested ? 'done' : ''}`}
                onClick={handleRequest}
                disabled={requesting || requested}
                title="Request collaboration"
              >
                {requested ? <span>✓</span> : <Send size={14} />}
              </button>
            </>
          )}
          {isOwnSkill && (
            <button className="btn-trash" onClick={() => onDelete(skill.id)}>
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SkillCard;
