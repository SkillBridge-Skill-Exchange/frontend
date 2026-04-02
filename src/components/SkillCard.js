/**
 * Premium SkillCard Component
 * ==============================
 */

import React, { useState } from 'react';
import { User, Trash2, Send, ThumbsUp, Award, Star, Zap, Layers, CheckCircle } from 'lucide-react';
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
        skill_id: skill.id || skill._id,
        rating: reviewRating,
        comment: reviewComment,
        reviewee_id: skill.user_id || skill.owner?._id || skill.user?._id
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
          <span className={`type-ribbon ${skill.type === 'offer' ? 'type-offer' : 'type-request'}`}>
            {skill.type === 'offer' ? '🎯 OFFERING' : '🔍 SEEKING'}
          </span>
          <span className="category-pill">{(skill.category || 'General').substring(0, 15).toUpperCase()}</span>
        </div>

        <div className="card-body">
          <h3>{skill.skill_name}</h3>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.8rem', borderRadius: '8px', background: level.bg, color: level.color, fontSize: '0.75rem', fontWeight: 800 }}>
            {level.icon} {level.label}
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
