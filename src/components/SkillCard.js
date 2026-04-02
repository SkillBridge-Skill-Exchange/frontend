/**
 * Premium SkillCard Component
 * ==============================
 */

import React, { useState } from 'react';
import { User, Trash2, Send, ThumbsUp, Award, Star, Zap, Layers, CheckCircle, Briefcase, Search } from 'lucide-react';
import API from '../api';

const badgeConfig = {
  beginner: { 
    label: 'Beginner', 
    color: '#1e40af', 
    bg: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
    border: '#60a5fa',
    icon: <Star size={16} />,
    shadow: '0 6px 20px rgba(59,130,246,0.3)',
    glow: 'rgba(59,130,246,0.4)'
  },
  intermediate: { 
    label: 'Intermediate', 
    color: '#d97706', 
    bg: 'linear-gradient(135deg, #fef3c7 0%, #fde047 100%)', 
    border: '#facc15',
    icon: <Zap size={16} />,
    shadow: '0 6px 20px rgba(245,158,11,0.3)',
    glow: 'rgba(245,158,11,0.4)'
  },
  advanced: { 
    label: 'Advanced', 
    color: '#7c3aed', 
    bg: 'linear-gradient(135deg, #f3e8ff 0%, #d8b4fe 100%)', 
    border: '#c084fc',
    icon: <Award size={16} />,
    shadow: '0 6px 20px rgba(139,92,246,0.3)',
    glow: 'rgba(139,92,246,0.4)'
  },
  expert: { 
    label: 'Expert', 
    color: '#dc2626', 
    bg: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)', 
    border: '#f87171',
    icon: <Layers size={16} />,
    shadow: '0 6px 20px rgba(239,68,68,0.3)',
    glow: 'rgba(239,68,68,0.4)'
  },
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
        skill_id: skill.id || skill._id, 
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
        skill_id: skill.id || skill._id, 
        comment: `Great ${skill.skill_name} skills!` 
      });
      setEndorsed(true);
    } catch (err) {
      setEndorsed(true); // optimistic for prototype
    }
    setEndorsing(false);
  };

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewing(true);
    try {
      await API.post('/reviews', {
        rating: reviewRating,
        comment: reviewComment,
        reviewed_user_id: skill.user_id || skill.owner?._id || skill.user?._id
      });
      setReviewed(true);
      setShowReviewModal(false);
    } catch (err) {
      setReviewed(true);
      setShowReviewModal(false);
    }
    setReviewing(false);
  };

  return (
    <>
      <div className="skill-card premium">
        <div className="card-top">
          <span className={`type-ribbon ${skill.type === 'offer' ? 'type-offer' : 'type-request'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {skill.type === 'offer' ? <><Briefcase size={14} /> OFFERING</> : <><Search size={14} /> SEEKING</>}
          </span>
          <span className="category-pill">{(skill.category || 'General').substring(0, 15).toUpperCase()}</span>
        </div>

        <div className="card-body">
          <h3>{skill.skill_name}</h3>
          
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.6rem', 
            padding: '0.65rem 1.25rem', 
            borderRadius: '14px', 
            background: level.bg, 
            color: level.color, 
            fontSize: '0.85rem', 
            fontWeight: 950,
            border: `2px solid ${level.border}`,
            boxShadow: level.shadow,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease'
          }}
          className="skill-level-badge"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = `0 8px 30px ${level.glow}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = level.shadow;
          }}
          >
            <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {level.icon} {level.label}
            </span>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3), transparent)',
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }} className="badge-shine" />
          </div>

          {skill.description ? (
            <p className="description-text">{skill.description}</p>
          ) : (
            <p className="description-text" style={{ fontStyle: 'italic', opacity: 0.6 }}>No detailed description provided.</p>
          )}
        </div>

        <div className="card-footer">
          <div className="user-overview">
            <div className="avatar-med">
              {skill.user?.name?.[0]?.toUpperCase() || skill.owner?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="user-name">{skill.user?.name || skill.owner?.name || 'Student'}</div>
              <div className="user-subline">{skill.user?.college || skill.owner?.college || 'University Partner'}</div>
            </div>
          </div>
          
          <div className="card-actions">
            {!isOwnSkill && currentUser && (
              <>
                <button 
                  className={`icon-btn secondary ${endorsed ? 'endorsed-active' : ''}`}
                  onClick={handleEndorse}
                  disabled={endorsing || endorsed}
                  title="Endorse this skill"
                  style={{ background: endorsed ? '#ecfdf5' : '', borderColor: endorsed ? '#52ab98' : '', color: endorsed ? '#52ab98' : '' }}
                >
                  {endorsed ? <CheckCircle size={18} /> : <ThumbsUp size={18} />}
                </button>
                <button 
                  className={`icon-btn secondary ${reviewed ? 'reviewed-active' : ''}`}
                  onClick={() => setShowReviewModal(true)}
                  disabled={reviewing || reviewed}
                  title="Leave a Review"
                  style={{ background: reviewed ? '#fff7ed' : '', borderColor: reviewed ? '#f59e0b' : '', color: reviewed ? '#f59e0b' : '' }}
                >
                  {reviewed ? <CheckCircle size={18} /> : <Star size={18} />}
                </button>
                <button 
                  className={`icon-btn primary ${requested ? 'requested-active' : ''}`}
                  onClick={handleRequest}
                  disabled={requesting || requested}
                  title="Request collaboration"
                >
                  {requested ? <CheckCircle size={18} /> : <Send size={18} />}
                </button>
              </>
            )}
            {isOwnSkill && (
              <button className="icon-btn danger" onClick={() => onDelete(skill.id || skill._id)} title="Remove Skill">
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {showReviewModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Rate Collaboration</h2>
              <button className="close-btn" onClick={() => setShowReviewModal(false)}>✕</button>
            </div>
            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-field">
                <label>Rating (1-5)</label>
                <div style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <Star 
                      key={num} 
                      size={32} 
                      fill={num <= reviewRating ? '#f59e0b' : 'none'} 
                      color={num <= reviewRating ? '#f59e0b' : '#cbd5e1'} 
                      onClick={() => setReviewRating(num)}
                      style={{ transition: 'all 0.2s' }}
                    />
                  ))}
                </div>
              </div>
              <div className="form-field">
                <label>Review Comment</label>
                <textarea 
                  className="textarea-premium" 
                  rows={3} 
                  placeholder="How was it working with them?..." 
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-publish" disabled={reviewing}>
                {reviewing ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default SkillCard;
