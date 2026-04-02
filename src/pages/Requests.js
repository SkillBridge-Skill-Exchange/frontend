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
  User, MessageCircle, ChevronDown 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Requests() {
  const [requests, setRequests] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const [showReview, setShowReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartChat = async (recipientId) => {
    if (!recipientId) {
      navigate('/messaging');
      return;
    }
    try {
      await API.post('/messages', { 
        recipient_id: recipientId, 
        content: "Hi! Let's chat." 
      });
      navigate('/messaging');
    } catch (err) {
      console.error(err);
      navigate('/messaging');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get('/requests');
      setRequests(res.data.data || { sent: [], received: [] });
    } catch (err) {
      console.error(err);
      // Mock data for prototype
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
      // Optimistic update for prototype
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
    } catch (err) {}
    setShowReview(null);
    setReviewForm({ rating: 5, comment: '' });
  };

  const statusConfig = {
    pending: { icon: <Clock size={16} />, color: '#f59e0b', bg: '#fef3c7', label: 'Pending' },
    accepted: { icon: <CheckCircle size={16} />, color: '#10b981', bg: '#d1fae5', label: 'Accepted' },
    declined: { icon: <XCircle size={16} />, color: '#ef4444', bg: '#fee2e2', label: 'Declined' },
  };

  if (loading) return <div className="page" style={{ textAlign: 'center', paddingTop: '8rem', color: '#94a3b8' }}>Loading requests...</div>;

  return (
    <div className="page requests-page">
      <div className="requests-header">
        <h1><Handshake size={32} /> Collaboration Requests</h1>
        <p>Manage incoming and outgoing collaboration requests.</p>
      </div>

      {/* TABS */}
      <div className="req-tabs">
        <button className={activeTab === 'received' ? 'active' : ''} onClick={() => setActiveTab('received')}>
          Received ({requests.received.length})
        </button>
        <button className={activeTab === 'sent' ? 'active' : ''} onClick={() => setActiveTab('sent')}>
          Sent ({requests.sent.length})
        </button>
      </div>

      {/* REQUEST CARDS */}
      <div className="req-list">
        {activeTab === 'received' && requests.received.map(r => (
          <div key={r.id} className="req-card">
            <div className="req-card-left">
              <div className="req-avatar">{r.requester?.name?.[0] || '?'}</div>
              <div className="req-info">
                <div className="req-name">{r.requester?.name}</div>
                <div className="req-skill">
                  Wants to collaborate on <strong>{r.skill?.skill_name}</strong>
                </div>
                <div className="req-message">"{r.message}"</div>
              </div>
            </div>
            <div className="req-card-right">
              <div className="req-status" style={{ background: statusConfig[r.status].bg, color: statusConfig[r.status].color }}>
                {statusConfig[r.status].icon} {statusConfig[r.status].label}
              </div>
              {r.status === 'pending' && (
                <div className="req-actions">
                  <button className="req-btn accept" onClick={() => updateStatus(r.id, 'accepted')}>
                    <CheckCircle size={16} /> Accept
                  </button>
                  <button className="req-btn decline" onClick={() => updateStatus(r.id, 'declined')}>
                    <XCircle size={16} /> Decline
                  </button>
                </div>
              )}
              {r.status === 'accepted' && (
                <div className="req-accepted-actions">
                  <button className="req-btn chat" onClick={() => handleStartChat(r.requester?._id || r.requester?.id)}>
                    <MessageCircle size={16} /> Chat
                  </button>
                  <button className="req-btn review" onClick={() => setShowReview(r.id)}>
                    <Star size={16} /> Review
                  </button>
                </div>
              )}
            </div>

            {/* INLINE REVIEW FORM */}
            {showReview === r.id && (
              <div className="review-inline">
                <h4>Rate Collaboration with {r.requester?.name}</h4>
                <div className="star-selector">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star 
                      key={s} 
                      size={28} 
                      fill={s <= reviewForm.rating ? '#52ab98' : 'none'} 
                      stroke={s <= reviewForm.rating ? '#52ab98' : '#cbd5e1'}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                    />
                  ))}
                </div>
                <textarea 
                  placeholder="Share your experience collaborating with this student..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="review-textarea"
                  rows={3}
                />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button className="req-btn accept" onClick={() => submitReview(r.requester?.id)}>
                    <Send size={16} /> Submit Review
                  </button>
                  <button className="req-btn decline" onClick={() => setShowReview(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {activeTab === 'sent' && requests.sent.map(r => (
          <div key={r.id} className="req-card">
            <div className="req-card-left">
              <div className="req-avatar" style={{ background: '#52ab98' }}>
                <Send size={18} />
              </div>
              <div className="req-info">
                <div className="req-name">To: {r.skill?.owner?.name || 'Student'}</div>
                <div className="req-skill">
                  Requesting collaboration on <strong>{r.skill?.skill_name}</strong>
                </div>
                <div className="req-message">"{r.message}"</div>
              </div>
            </div>
            <div className="req-card-right">
              <div className="req-status" style={{ background: statusConfig[r.status].bg, color: statusConfig[r.status].color }}>
                {statusConfig[r.status].icon} {statusConfig[r.status].label}
              </div>
              {r.status === 'accepted' && (
                <div className="req-accepted-actions" style={{ marginTop: '0.75rem' }}>
                  <button className="req-btn chat" onClick={() => handleStartChat(r.skill?.owner?._id || r.skill?.owner?.id)}>
                    <MessageCircle size={16} /> Chat
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Requests;
