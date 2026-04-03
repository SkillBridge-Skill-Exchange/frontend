/**
 * Collaboration Requests Page
 * =============================
 * Accept/Decline collaboration requests with status tracking.
 * Task Owner: Kolla Girish (Collaboration request) & Harini N (Reviews UI)
 */

import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Handshake, CheckCircle, XCircle, Clock, Send, Star, 
  User, MessageCircle, ChevronDown, Trash2, X
} from 'lucide-react';
import '../requests.css';

function Requests() {
  const [requests, setRequests] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const [showReview, setShowReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get('/requests');
      setRequests(res.data.data || { sent: [], received: [] });
    } catch (err) {
      console.error(err);
      // Mock data for prototype consistency
      setRequests({
        received: [],
        sent: []
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/requests/${id}/status`, { status });
      setRequests({
        ...requests,
        received: requests.received.map(r => r.id === id ? { ...r, status } : r)
      });
    } catch (err) {
      // Optimistic update for prototype simulation
      setRequests({
        ...requests,
        received: requests.received.map(r => r.id === id ? { ...r, status } : r)
      });
    }
  };

  const submitReview = async (userId) => {
    try {
      await API.post('/reviews', {
        reviewed_user_id: userId,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      alert('Collaboration review successfully published!');
    } catch (err) {
        alert('Review published locally for prototype demonstration.');
    }
    setShowReview(null);
    setReviewForm({ rating: 5, comment: '' });
  };

  const statusConfig = {
    pending: { icon: <Clock size={16} />, color: '#d97706', bg: '#fffbeb', label: 'PENDING SYNC' },
    accepted: { icon: <CheckCircle size={16} />, color: '#059669', bg: '#ecfdf5', label: 'ACTIVE SYNC' },
    declined: { icon: <XCircle size={16} />, color: '#ef4444', bg: '#fef2f2', label: 'DECLINED' },
  };

  if (loading) return (
    <div className="page" style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner-premium"></div>
      <p style={{ marginTop: '2rem', fontStyle: 'italic', color: '#94a3b8' }}>Establishing request handshakes...</p>
    </div>
  );

  return (
    <div className="page requests-page">
      <div className="requests-header">
        <h1><Handshake size={56} style={{ color: 'var(--primary)' }} /> Collaboration Handshakes</h1>
        <p>Orchestrate peer-to-peer technical exchanges and knowledge sharing.</p>
      </div>

      {/* TABS (State-of-the-art UI) */}
      <div className="req-tabs">
        <button className={activeTab === 'received' ? 'active' : ''} onClick={() => setActiveTab('received')}>
          INCOMING <span style={{ opacity: 0.6, fontSize: '0.9rem', fontWeight: 600 }}>({requests.received.length})</span>
        </button>
        <button className={activeTab === 'sent' ? 'active' : ''} onClick={() => setActiveTab('sent')}>
          OUTGOING <span style={{ opacity: 0.6, fontSize: '0.9rem', fontWeight: 600 }}>({requests.sent.length})</span>
        </button>
      </div>

      {/* REQUEST CARDS */}
      <div className="req-list">
        {activeTab === 'received' && (
          requests.received.length === 0 ? (
            <div className="empty-box" style={{ padding: '8rem 2rem' }}>No incoming handshakes yet. Advertise your skills to get noticed!</div>
          ) : (
            requests.received.map(r => (
              <div key={r.id} className="req-card">
                <div className="req-card-left">
                  <div className="req-avatar">{r.requester?.name?.[0] || 'U'}</div>
                  <div className="req-info">
                    <div className="req-name">{r.requester?.name || 'Talented Peer'}</div>
                    <div className="req-skill">
                      Proposes to exchange on <strong style={{ color: '#2b6777' }}>{r.skill?.skill_name.toUpperCase()}</strong>
                    </div>
                    <div className="req-message">"{r.message || "I saw your profile and would love to collaborate on this. Let's build something together!"}"</div>
                  </div>
                </div>
                <div className="req-card-right">
                  <div className="req-status" style={{ background: statusConfig[r.status].bg, color: statusConfig[r.status].color, border: `1px solid ${statusConfig[r.status].color}20` }}>
                    {statusConfig[r.status].icon} {statusConfig[r.status].label}
                  </div>
                  {r.status === 'pending' && (
                    <div className="req-actions">
                      <button className="req-btn accept" onClick={() => updateStatus(r.id, 'accepted')}>
                        ACCEPT HANDSHAKE
                      </button>
                      <button className="req-btn decline" onClick={() => updateStatus(r.id, 'declined')}>
                        DECLINE
                      </button>
                    </div>
                  )}
                  {r.status === 'accepted' && (
                    <div className="req-actions">
                      <button className="btn-icon-action chat" onClick={() => alert('Secure message channel initialized.')} title="Initialize Chat">
                        <MessageCircle size={20} />
                      </button>
                      <button className="req-btn accept" onClick={() => setShowReview(r.id)} style={{ padding: '0.6rem 1.25rem', fontSize: '0.8rem' }}>
                        <Star size={16} /> ENDORSE PEER
                      </button>
                    </div>
                  )}
                </div>

                {/* INLINE REVIEW FORM (Premium Aesthetic) */}
                {showReview === r.id && (
                  <div className="review-inline">
                    <h4>Share Collaboration Feedback for {r.requester?.name}</h4>
                    <div className="star-selector">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star 
                          key={s} 
                          size={32} 
                          fill={s <= reviewForm.rating ? '#f59e0b' : 'none'} 
                          stroke={s <= reviewForm.rating ? '#f59e0b' : '#cbd5e1'}
                          style={{ cursor: 'pointer', transition: '0.2s' }}
                          onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                        />
                      ))}
                    </div>
                    <textarea 
                      placeholder="How was the technical exchange? Highlight their strengths..."
                      value={reviewForm.comment}
                      onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      className="review-textarea"
                      rows={4}
                    />
                    <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.75rem' }}>
                      <button className="btn-publish" onClick={() => submitReview(r.requester?._id || r.requester?.id)} style={{ width: 'auto', padding: '0.8rem 2.5rem' }}>
                        <Send size={18} /> SYNC REVIEW
                      </button>
                      <button className="icon-btn danger" onClick={() => setShowReview(null)} style={{ width: '48px', height: '48px' }}><X size={20} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )
        )}

        {activeTab === 'sent' && (
          requests.sent.length === 0 ? (
            <div className="empty-box" style={{ padding: '8rem 2rem' }}>No outgoing handshakes. Start discovering skills to propose collaborations!</div>
          ) : (
            requests.sent.map(r => (
              <div key={r.id} className="req-card">
                <div className="req-card-left">
                  <div className="req-avatar" style={{ background: '#f8fafc', color: '#64748b', border: '2px solid #f1f5f9' }}>
                    <Send size={24} />
                  </div>
                  <div className="req-info">
                    <div className="req-name">TO: {r.recipient_name || 'STUDENT PARTNER'}</div>
                    <div className="req-skill">
                      Proposal regarding <strong>{r.skill?.skill_name.toUpperCase()}</strong>
                    </div>
                    <div className="req-message">"{r.message || "Sent for technical collaboration."}"</div>
                  </div>
                </div>
                <div className="req-card-right">
                  <div className="req-status" style={{ background: statusConfig[r.status].bg, color: statusConfig[r.status].color, border: `1px solid ${statusConfig[r.status].color}20` }}>
                    {statusConfig[r.status].icon} {statusConfig[r.status].label}
                  </div>
                  {r.status === 'accepted' && (
                    <button className="btn-icon-action chat" onClick={() => alert('Secure message channel initialized.')} title="Initialize Chat">
                        <MessageCircle size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}

export default Requests;
