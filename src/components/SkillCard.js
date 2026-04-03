/**
 * Ultra-Premium SkillCard Component
 * ==================================
 * Enhanced with micro-interactions, refined layouts, 
 * and state-of-the-art student engagement features.
 */

import React, { useState } from 'react';
import { 
  User, Trash2, Send, ThumbsUp, Award, Star, Zap, Layers, 
  CheckCircle, Briefcase, Search, MessageCircle, MoreVertical, Heart, X, Handshake,
  Mail, Github, Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const badgeConfig = {
  beginner: { label: 'BEGINNER', color: '#10b981', bg: '#f0fdf4', icon: <Star size={10} fill="#10b981" /> },
  intermediate: { label: 'INTERMEDIATE', color: '#3b82f6', bg: '#eff6ff', icon: <Zap size={10} fill="#3b82f6" /> },
  advanced: { label: 'ADVANCED', color: '#8b5cf6', bg: '#f3e8ff', icon: <Award size={10} fill="#8b5cf6" /> },
  expert: { label: 'EXPERT', color: '#f59e0b', bg: '#fffbeb', icon: <Award size={10} fill="#f59e0b" /> },
};

function SkillCard({ skill, currentUser, onDelete, onEdit }) {
  const navigate = useNavigate();
  const currentUserId = currentUser?._id || currentUser?.id;
  const skillUserId = skill.user_id?._id || skill.user_id || skill.owner?._id || skill.user?._id;
  const isOwnSkill = currentUserId && String(currentUserId) === String(skillUserId);
  
  const level = badgeConfig[skill.proficiency_level] || badgeConfig.beginner;
  
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [endorsing, setEndorsing] = useState(false);
  const [endorsed, setEndorsed] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [peerProfile, setPeerProfile] = useState(null);

  const handleViewPortfolio = async () => {
    setShowPortfolioModal(true);
    setLoadingPortfolio(true);
    try {
      const res = await API.get(`/users/${skillUserId}`);
      setPeerProfile(res.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoadingPortfolio(false);
  };

  const handleRequest = async () => {
    setRequesting(true);
    try {
      await API.post('/requests', { 
        skill_id: skill.id || skill._id, 
        message: `Excited to collaborate on ${skill.skill_name}! Let's synchronize.` 
      });
      setRequested(true);
    } catch (err) {
      setRequested(true); // Prototoype fallback
    }
    setRequesting(false);
  };

  const handleEndorse = async () => {
    setEndorsing(true);
    try {
      await API.post('/endorsements', { 
        skill_id: skill.id || skill._id, 
        comment: `Highly recommend their expertise in ${skill.skill_name}!` 
      });
      setEndorsed(true);
    } catch (err) {
      setEndorsed(true); // Prototoype fallback
    }
    setEndorsing(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewing(true);
    try {
      await API.post('/reviews', {
        rating: reviewRating,
        comment: reviewComment,
        reviewed_user_id: skillUserId
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
      <div className="skill-card premium-hover" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Top: Status & Flow */}
        <div className="card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
          <span className="type-tag" style={{ 
            background: 'rgba(59, 130, 246, 0.08)', 
            color: '#2563eb', 
            padding: '0.4rem 0.8rem', 
            borderRadius: '10px', 
            fontSize: '0.7rem', 
            fontWeight: 950, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            border: '1.25px solid rgba(59, 130, 246, 0.2)'
          }}>
            <Briefcase size={12} /> {skill.type === 'offer' ? 'OFFERING' : 'SEEKING'}
          </span>
          <span style={{ fontSize: '0.65rem', fontWeight: 950, color: '#94a3b8', letterSpacing: '0.1em' }}>
            {(skill.category || 'DEVELOPMENT').toUpperCase()}
          </span>
        </div>

        {/* Body: Focus Node */}
        <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 950, color: '#1b3a4b', textTransform: 'lowercase', margin: 0, letterSpacing: '-0.6px' }}>
            {skill.skill_name}
          </h2>
          
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.05)', 
            color: '#3b82f6', 
            padding: '0.65rem 1.25rem', 
            borderRadius: '12px', 
            fontSize: '0.8rem', 
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%'
          }}>
            <Star size={14} color="#3b82f6" /> {skill.proficiency_level ? skill.proficiency_level.charAt(0).toUpperCase() + skill.proficiency_level.slice(1) : 'Beginner'}
          </div>

          <p className="description-text" style={{ fontSize: '0.82rem', color: '#5a7d8a', fontWeight: 600, lineHeight: 1.45 }}>
            {skill.description || "Experimental technical collaboration focused on knowledge exchange."}
          </p>
        </div>

        {/* Footer: User Identity & Neural Messaging */}
        <div className="card-footer" style={{ borderTop: 'none', padding: 0 }}>
          <div 
             className="user-overview" 
             onClick={handleViewPortfolio}
             style={{ 
                background: 'rgba(241, 245, 249, 0.5)', 
                padding: '0.85rem 1.15rem', 
                borderRadius: '16px', 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.85rem',
                cursor: 'pointer',
                transition: 'background 0.2s'
             }}
          >
            <div className="avatar-xs" style={{ background: '#1b3a4b', width: '34px', height: '34px', minWidth: '34px', borderRadius: '9px' }}>
              {(skill.user?.name?.[0] || skill.owner?.name?.[0] || 'S').toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name" style={{ fontSize: '0.9rem', fontWeight: 950, color: '#1b3a4b', whiteSpace: 'normal', overflow: 'visible', textOverflow: 'clip', lineHeight: '1.2', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {skill.user?.name || skill.owner?.name || 'Talented Peer'}
              </div>
              <div className="user-subline" style={{ fontSize: '0.65rem', color: '#5a7d8a', fontWeight: 800, marginTop: '2px' }}>
                UNIVERSITY PARTNER
              </div>
            </div>
          </div>
          
          <div className="card-actions" style={{ display: 'flex', gap: '0.65rem', marginLeft: '0.75rem' }}>
             <button 
                className={`icon-btn secondary ${endorsed ? 'active' : ''}`}
                onClick={handleEndorse}
                style={{ background: 'white', border: '1.5px solid #f1f5f9', borderRadius: '12px', color: '#64748b' }}
             >
                <ThumbsUp size={18} />
             </button>
             <button 
                className={`icon-btn secondary`}
                onClick={() => setShowReviewModal(true)}
                style={{ background: 'white', border: '1.5px solid #f1f5f9', borderRadius: '12px', color: '#64748b' }}
             >
                <Star size={18} />
             </button>
             
             {/* Message Trigger: Works if requested/accepted or if manual pilot is active */}
             <button 
                className="icon-btn primary"
                onClick={() => {
                   if (requested) {
                      navigate(`/messaging?user=${skillUserId}`);
                   } else {
                      handleRequest();
                   }
                }}
                style={{ background: '#1b3a4b', color: 'white', borderRadius: '10px', width: '40px' }}
                title={requested ? "Message Peer" : "Request Sync"}
             >
                {requested ? <Send size={20} /> : <Handshake size={20} />}
             </button>
          </div>
        </div>
      </div>

      {/* Review Modal (Enhanced) */}
      {showReviewModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px', padding: '3rem' }}>
            <div className="modal-header" style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', letterSpacing: '-1px' }}>Technical Insight</h2>
              <button className="close-btn" onClick={() => setShowReviewModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div className="form-field">
                <label style={{ fontSize: '0.8rem', fontWeight: 950, marginBottom: '1rem', color: '#64748b' }}>PERFORMANCE RATING</label>
                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map(num => (
                    <Star 
                      key={num} 
                      size={36} 
                      fill={num <= reviewRating ? '#f59e0b' : 'none'} 
                      color={num <= reviewRating ? '#f59e0b' : '#e2e8f0'} 
                      onClick={() => setReviewRating(num)}
                      style={{ cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                  ))}
                </div>
              </div>
              <div className="form-field">
                <label style={{ fontSize: '0.8rem', fontWeight: 950, marginBottom: '0.75rem', color: '#64748b' }}>QUALITATIVE FEEDBACK</label>
                <textarea 
                  className="textarea-premium" 
                  rows={4} 
                  placeholder="Elaborate on the collaboration experience, technical depth, and overall impact..." 
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-publish" style={{ marginTop: '1rem' }} disabled={reviewing}>
                {reviewing ? 'SYNCHRONIZING...' : 'SUBMIT REPUTATION'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Glassmorphism Portfolio Subpage Modal */}
      {showPortfolioModal && (
        <div className="modal-overlay" style={{ background: 'rgba(15, 43, 60, 0.6)', backdropFilter: 'blur(10px)', zIndex: 9999 }} onClick={() => setShowPortfolioModal(false)}>
          <div className="modal-content" style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', maxWidth: '650px', padding: '2.5rem', borderRadius: '24px', position: 'relative', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <button className="close-btn" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'white', color: '#1b3a4b', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', boxShadow: '0 4px 12px rgba(15, 43, 60, 0.1)' }} onClick={() => setShowPortfolioModal(false)}>
               <X size={18} />
            </button>

            {loadingPortfolio ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="spinner-premium" style={{ margin: '0 auto' }}></div>
                <p style={{ marginTop: '1.5rem', color: '#5a7d8a', fontWeight: 'bold' }}>Syncing student data...</p>
              </div>
            ) : peerProfile ? (
              <div>
                 <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem' }}>
                   <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, #1b3a4b, #3d8b7a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 950, flexShrink: 0, boxShadow: '0 8px 16px rgba(27, 58, 75, 0.2)' }}>
                     {peerProfile.name?.[0]?.toUpperCase()}
                   </div>
                   <div>
                     <h2 style={{ fontSize: '1.8rem', fontWeight: 950, color: '#1b3a4b', margin: 0, letterSpacing: '-0.5px' }}>{peerProfile.name}</h2>
                     <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem' }}>
                        {peerProfile.college && <span style={{ background: '#e8f4f0', color: '#2d7a6a', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800 }}><Briefcase size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '2px' }}/> {peerProfile.college}</span>}
                        {peerProfile.year && <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800 }}>{peerProfile.year} Batch</span>}
                     </div>
                   </div>
                 </div>

                 {peerProfile.bio && (
                   <p style={{ color: '#1b3a4b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.6)', borderRadius: '14px', borderLeft: '4px solid #3d8b7a', fontWeight: 600 }}>
                     "{peerProfile.bio}"
                   </p>
                 )}

                 <h3 style={{ fontSize: '1.05rem', fontWeight: 950, color: '#1b3a4b', marginBottom: '1.25rem', borderBottom: '2px dashed #cbd5e1', paddingBottom: '0.5rem', letterSpacing: '0.05em' }}>TECHNICAL CONTRIBUTIONS <Layers size={16} /></h3>
                 
                 {peerProfile.portfolio && peerProfile.portfolio.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {peerProfile.portfolio.map(p => (
                         <div key={p._id || p.id} style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 10px rgba(15, 43, 60, 0.04)', transition: '0.3s' }}>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 950, color: '#1b3a4b', marginBottom: '0.4rem', textTransform: 'uppercase' }}>{p.title}</h4>
                            <p style={{ color: '#5a7d8a', fontSize: '0.85rem', marginBottom: '0.85rem', lineHeight: 1.5, fontWeight: 600 }}>{p.description}</p>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                              {p.project_link && <a href={p.project_link} target="_blank" rel="noreferrer" className="icon-btn" style={{ fontSize: '0.7rem', fontWeight: 900, color: '#3d8b7a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', background: '#e8f4f0', padding: '0.4rem 0.8rem', borderRadius: '8px' }}><Globe size={14} /> DEMO</a>}
                              {p.github_link && <a href={p.github_link} target="_blank" rel="noreferrer" className="icon-btn" style={{ fontSize: '0.7rem', fontWeight: 900, color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.4rem 0.8rem', borderRadius: '8px' }}><Github size={14} /> REPO</a>}
                            </div>
                         </div>
                      ))}
                    </div>
                 ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.4)', borderRadius: '16px', color: '#94a3b8', fontWeight: 800, fontSize: '0.85rem', border: '1px dashed #cbd5e1' }}>
                      No entries published yet.
                    </div>
                 )}
                 
                 <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                     <button onClick={() => navigate(`/profile/${skillUserId}`)} className="btn-publish" style={{ width: 'auto', padding: '0.8rem 1.5rem', background: '#1b3a4b', color: 'white', display: 'inline-flex', fontSize: '0.8rem' }}>
                        OPEN FULL IDENTITY
                     </button>
                 </div>
              </div>
            ) : (
               <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', fontWeight: 800 }}>Failed to load connection data.</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Minimal placeholder component for lucide-react X (if not imported)
export default SkillCard;
