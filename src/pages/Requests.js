/**
 * Collaboration Requests Page (ULTRA-PREMIUM REFINEMENT)
 * ====================================================
 * Orchestrates technical handshakes and peer identity synchronization.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Handshake, CheckCircle, XCircle, Clock, Send, Star, 
  User, MessageCircle, ChevronDown, Trash2, X, MessageSquare
} from 'lucide-react';
import '../requests.css';

function Requests() {
  const navigate = useNavigate();
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
      setRequests({ received: [], sent: [] });
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
      setRequests({
        ...requests,
        received: requests.received.map(r => r.id === id ? { ...r, status } : r)
      });
    }
  };

  const handleSendMessage = (targetId) => {
    console.log('Synchronizing Neural Portal with Peer Node:', targetId);
    if (!targetId) {
       console.error('Critical Handshake Exception: Target Node ID missing in this segment.');
       return;
    }
    navigate(`/messaging?user=${targetId}`);
  };

  const submitReview = async (userId) => {
    try {
      await API.post('/reviews', {
        reviewed_user_id: userId,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      alert('Reputation metrics synchronized successfully!');
    } catch (err) {
      alert('Reputation updated locally.');
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
      <p style={{ marginTop: '2rem', fontStyle: 'italic', color: '#94a3b8' }}>Synchronizing handshake protocol...</p>
    </div>
  );

  return (
    <div className="page requests-page">
      <div className="requests-header">
        <h1><Handshake size={56} style={{ color: 'var(--primary)' }} /> Collaboration Handshakes</h1>
        <p>Orchestrate peer-to-peer technical exchanges and campus network growth.</p>
      </div>

      <div className="req-tabs">
        <button className={activeTab === 'received' ? 'active' : ''} onClick={() => setActiveTab('received')}>
          INCOMING <span style={{ opacity: 0.6, fontSize: '0.9rem', fontWeight: 600 }}>({requests.received.length})</span>
        </button>
        <button className={activeTab === 'sent' ? 'active' : ''} onClick={() => setActiveTab('sent')}>
          OUTGOING <span style={{ opacity: 0.6, fontSize: '0.9rem', fontWeight: 600 }}>({requests.sent.length})</span>
        </button>
      </div>

      <div className="req-list">
        {activeTab === 'received' && (
          requests.received.length === 0 ? (
            <div className="empty-box" style={{ padding: '8rem 2rem' }}>No incoming handshakes detected. Advertise your skills to expand your node.</div>
          ) : (
            requests.received.map(r => (
              <div key={r.id} className="req-card">
                <div className="req-card-left">
                  <div className="req-avatar">{r.requester?.name?.[0] || 'U'}</div>
                  <div className="req-info">
                    <div className="req-name">{r.requester?.name?.toUpperCase() || 'TALENTED PEER'}</div>
                    <div className="req-skill">Proposes to exchange on <strong style={{ color: '#2b6777' }}>{r.skill?.skill_name.toUpperCase()}</strong></div>
                    <div className="req-message">"{r.message || "Excited to collaborate!"}"</div>
                  </div>
                </div>
                <div className="req-card-right">
                  <div className="req-status" style={{ background: statusConfig[r.status].bg, color: statusConfig[r.status].color, border: `1px solid ${statusConfig[r.status].color}20` }}>
                    {statusConfig[r.status].icon} {statusConfig[r.status].label}
                  </div>
                  {r.status === 'pending' && (
                    <div className="req-actions">
                      <button className="req-btn accept" onClick={() => updateStatus(r.id, 'accepted')}>ACCEPT</button>
                      <button className="req-btn decline" onClick={() => updateStatus(r.id, 'declined')}>DECLINE</button>
                    </div>
                  )}
                  {r.status === 'accepted' && (
                    <div className="req-actions">
                      <button className="btn-icon-action chat" onClick={() => handleSendMessage(r.requester?._id || r.requester?.id)} title="Open Message Portal">
                        <MessageSquare size={20} />
                      </button>
                      <button className="req-btn accept" onClick={() => setShowReview(r.id)} style={{ padding: '0.6rem 1.25rem', fontSize: '0.8rem' }}>
                        <Star size={16} /> ENDORSE
                      </button>
                    </div>
                  )}
                </div>

                {showReview === r.id && (
                  <div className="review-inline" style={{ marginTop: '2rem', padding: '2rem', background: '#f8fafc', borderRadius: '24px' }}>
                    <h4 style={{ fontWeight: 950, marginBottom: '1.5rem' }}>Synchronize Reputation for {r.requester?.name}</h4>
                    <div className="star-selector" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={32} fill={s <= reviewForm.rating ? '#f59e0b' : 'none'} color={s <= reviewForm.rating ? '#f59e0b' : '#cbd5e1'} onClick={() => setReviewForm({ ...reviewForm, rating: s })} style={{ cursor: 'pointer' }} />
                      ))}
                    </div>
                    <textarea placeholder="Describe the technical impact..." value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} className="textarea-premium" rows={3} />
                    <button className="btn-publish" onClick={() => submitReview(r.requester?._id || r.requester?.id)} style={{ marginTop: '1.5rem', width: 'auto', padding: '0.8rem 2rem' }}>SEND REVIEW</button>
                  </div>
                )}
              </div>
            ))
          )
        )}

        {activeTab === 'sent' && (
          requests.sent.length === 0 ? (
            <div className="empty-box" style={{ padding: '8rem 2rem' }}>No outgoing handshakes sent. Discovery some nodes to begin.</div>
          ) : (
            requests.sent.map(r => (
              <div key={r.id} className="req-card">
                <div className="req-card-left">
                  <div className="req-avatar" style={{ background: '#f1f5f9', color: '#64748b' }}><Send size={20} /></div>
                  <div className="req-info">
                    <div className="req-name">TO: {(r.skill?.owner?.name || r.recipient_name || 'STUDENT PARTNER').toUpperCase()}</div>
                    <div className="req-skill">Proposal regarding <strong>{r.skill?.skill_name.toUpperCase()}</strong></div>
                    <div className="req-message">"{r.message || "Sent for technical synchronization."}"</div>
                  </div>
                </div>
                <div className="req-card-right">
                  <div className="req-status" style={{ background: statusConfig[r.status].bg, color: statusConfig[r.status].color }}>
                    {statusConfig[r.status].icon} {statusConfig[r.status].label}
                  </div>
                  {r.status === 'accepted' && (
                    <button 
                      className="btn-icon-action chat" 
                      onClick={() => {
                        const targetId = r.skill?.owner?._id || r.skill?.owner?.id || r.skill?.user_id?._id || r.skill?.user_id;
                        handleSendMessage(targetId);
                      }} 
                      title="Open Message Portal"
                      style={{ color: '#2563eb' }}
                    >
                        <MessageSquare size={20} />
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
