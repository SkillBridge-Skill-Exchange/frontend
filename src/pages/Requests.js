/**
 * Collaboration Requests Page (Final Lifecycle)
 * ==============================================
 * Functionalized Lifecycle steps: Connecting & Review.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Handshake, CheckCircle, XCircle, Clock, Send, Star,
  User, MessageCircle, ChevronDown, Trash2, X, MessageSquare,
  Building, GraduationCap, Zap
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

  const statusConfig = {
    pending: { label: 'PENDING', bg: '#fef3c7', color: '#d97706', icon: <Clock size={14} /> },
    accepted: { label: 'ACCEPTED', bg: '#d1fae5', color: '#059669', icon: <CheckCircle size={14} /> },
    connecting: { label: 'CONNECTING', bg: '#dbeafe', color: '#2563eb', icon: <MessageCircle size={14} /> },
    completed: { label: 'COMPLETED', bg: '#f0fdf4', color: '#10b981', icon: <CheckCircle size={14} /> },
    declined: { label: 'DECLINED', bg: '#fee2e2', color: '#ef4444', icon: <XCircle size={14} /> },
  };

  const initializeChat = (userId) => {
    if (userId) navigate(`/messaging?user=${userId}`);
    else navigate('/messaging');
  };

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get('/requests');
      setRequests(res.data.data || { sent: [], received: [] });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/requests/${id}/status`, { status });
      fetchRequests();
    } catch (err) { console.error(err); }
  };

  const handleConnect = async (requestId) => {
    try {
      // Update status to 'connecting' (Step 3)
      await API.patch(`/requests/${requestId}/status`, { status: 'connecting' });
      navigate('/messaging');
    } catch (err) {
      console.error(err);
      navigate('/messaging');
    }
  };

  const submitReview = async (requestId, userId) => {
    try {
      await API.post('/reviews', {
        reviewed_user_id: userId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        request_id: requestId // Optionally pass to mark complete
      });
      // Explicitly mark as completed (Step 4)
      await API.patch(`/requests/${requestId}/status`, { status: 'completed' });
      
      setShowReview(null);
      setReviewForm({ rating: 5, comment: '' });
      fetchRequests();
    } catch (err) { console.error(err); }
  };

  const renderLifecycle = (status) => {
    const steps = [
      { id: 'pending', label: 'Requested' },
      { id: 'accepted', label: 'Accepted' },
      { id: 'connecting', label: 'Connecting' },
      { id: 'completed', label: 'Review' }
    ];
    
    // Status index mapping
    const statusMap = { 'pending': 0, 'accepted': 1, 'connecting': 2, 'completed': 3, 'declined': -1 };
    const currentIndex = statusMap[status] !== undefined ? statusMap[status] : 1;

    return (
      <div className="lifecycle-bar">
        {steps.map((step, idx) => (
          <div key={step.id} className={`status-step ${idx <= currentIndex ? (idx === currentIndex ? 'active' : 'completed') : ''}`}>
            <div className="step-dot">{idx < currentIndex ? <CheckCircle size={14} /> : idx + 1}</div>
            <div className="step-label">{step.label}</div>
          </div>
        ))}
      </div>
    );
  };

  const isRecent = (dateStr) => {
    const diff = (new Date() - new Date(dateStr)) / (1000 * 60 * 60);
    return diff < 24;
  };

  if (loading) return <div className="page" style={{ textAlign: 'center', paddingTop: '8rem' }}><div className="spinner-premium" style={{ margin: '0 auto' }}></div></div>;

  const currentList = activeTab === 'received' ? requests.received : requests.sent;
  const pendingItems = currentList.filter(r => r.status === 'pending');
  // Both accepted and connecting are "Active"
  const activeItems = currentList.filter(r => ['accepted', 'connecting', 'completed'].includes(r.status));

  return (
    <div className="page requests-page">
      <div className="requests-header">
        <h1 style={{ fontSize: '2.2rem', fontWeight: 950, color: '#1b3a4b', letterSpacing: '-1.5px' }}>
          <Handshake size={38} style={{ marginRight: '0.5rem' }} /> Collaboration Hub
        </h1>
        <p style={{ fontWeight: 600, color: '#5a7d8a' }}>Manage your campus learning partnerships.</p>
      </div>

      <div className="req-tabs" style={{ marginBottom: '2.5rem' }}>
        <button className={activeTab === 'received' ? 'active' : ''} onClick={() => setActiveTab('received')}>
          Partnerships Feedback ({requests.received.length})
        </button>
        <button className={activeTab === 'sent' ? 'active' : ''} onClick={() => setActiveTab('sent')}>
          Your Proposals ({requests.sent.length})
        </button>
      </div>

      <div className="req-list">
        {pendingItems.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
             <h3 className="section-header"><Clock size={18} /> Awaiting Decision ({pendingItems.length})</h3>
             {pendingItems.map(r => renderRequestCard(r, activeTab, true))}
          </div>
        )}

        {activeItems.length > 0 && (
          <div className="active-collab-section">
             <h3 className="section-header" style={{ color: '#3d8b7a' }}><Zap size={18} /> Active Partnerships ({activeItems.filter(r => r.status !== 'completed').length})</h3>
             {activeItems.map(r => renderRequestCard(r, activeTab, false))}
          </div>
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
                    <div className="req-name">TO: {r.skill?.owner?.name || r.recipient_name || 'STUDENT PARTNER'}</div>
                    <div className="req-skill">
                      Proposal regarding <strong>{r.skill?.skill_name?.toUpperCase() || 'SKILL'}</strong>
                    </div>
                    <div className="req-message">"{r.message || "Sent for technical collaboration."}"</div>
                  </div>
                </div>
                <div className="req-card-right">
                  <div className="req-status" style={{ background: statusConfig[r.status].bg, color: statusConfig[r.status].color }}>
                    {statusConfig[r.status].icon} {statusConfig[r.status].label}
                  </div>
                  {r.status === 'accepted' && (
                    <button className="btn-icon-action chat" onClick={() => initializeChat(r.skill?.owner?._id || r.skill?.owner?.id)} title="Initialize Chat">
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

  function renderRequestCard(r, type, isPending) {
    const partner = type === 'received' ? r.requester : r.skill?.owner || r.skill?.user_id;
    
    return (
      <div key={r.id} className="req-card" style={{ position: 'relative', opacity: r.status === 'declined' ? 0.6 : 1 }}>
        {isRecent(r.createdAt) && isPending && <div className="urgency-badge"><Zap size={12} /> NEW</div>}
        <div className="req-card-left">
          <div className="req-avatar" style={{ background: type === 'sent' ? 'linear-gradient(135deg, #3d8b7a, #2b6777)' : 'linear-gradient(135deg, #1b3a4b, #3d8b7a)' }}>
            {partner?.name?.[0]?.toUpperCase() || <User size={20} />}
          </div>
          <div className="req-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <span className="req-name">{partner?.name}</span>
              {partner?.department && (
                <div className="req-badge-campus"><Building size={12} /> {partner.department}</div>
              )}
              {partner?.year && (
                <div className="req-badge-campus"><GraduationCap size={12} /> {partner.year} Year</div>
              )}
            </div>
            <div className="req-skill">
              {type === 'received' ? 'Interested in your' : 'You requested their'} <strong>{r.skill?.skill_name}</strong>
            </div>
            <div className="req-message">"{r.message}"</div>
          </div>
        </div>

        <div className="req-card-right">
          {renderLifecycle(r.status)}
          
          {r.status === 'pending' && type === 'received' && (
            <div className="req-actions">
              <button className="req-btn accept" onClick={() => updateStatus(r.id, 'accepted')}>
                <CheckCircle size={16} /> Accept
              </button>
              <button className="req-btn decline" onClick={() => updateStatus(r.id, 'declined')}>
                <XCircle size={16} /> Decline
              </button>
            </div>
          )}

          {['accepted', 'connecting'].includes(r.status) && (
            <div className="req-accepted-actions">
              <button className="req-btn chat" onClick={() => handleConnect(r.id)}>
                <MessageCircle size={16} /> Connect & Chat
              </button>
              <button className="req-btn review" onClick={() => setShowReview(r.id)}>
                <Star size={16} /> Finalize & Rate
              </button>
            </div>
          )}

          {r.status === 'completed' && (
            <div className="req-accepted-actions" style={{ justifyContent: 'center' }}>
               <span style={{ fontWeight: 950, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <CheckCircle size={20} /> Partnership Successful!
               </span>
            </div>
          )}
        </div>

        {showReview === r.id && (
          <div className="review-inline">
             <h4>Rate Collaboration Completion</h4>
             <div className="star-selector">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={28} fill={s <= reviewForm.rating ? '#3d8b7a' : 'none'} stroke={s <= reviewForm.rating ? '#3d8b7a' : '#cbd5e1'} onClick={() => setReviewForm({ ...reviewForm, rating: s })} />
                ))}
             </div>
             <textarea placeholder="Feedback on this collaboration..." value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} className="review-textarea" rows={3} />
             <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="req-btn accept" onClick={() => submitReview(r.id, partner.id || partner._id)}>Complete Collaboration</button>
                <button className="req-btn decline" onClick={() => setShowReview(null)}>Not Yet</button>
             </div>
          </div>
        )}
      </div>
    );
  }
}

export default Requests;
