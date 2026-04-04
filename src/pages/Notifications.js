/**
 * Notifications Page
 * ===================
 * Displays real-time alerts for matches, collaboration requests, endorsements.
 * Task Owner: B Rahul (Notifications UI)
 */

import React, { useState, useEffect } from 'react';
import API from '../api';
import { 
  Bell, BellOff, CheckCircle, UserPlus, MessageCircle, 
  Award, Sparkles, Clock, Check 
} from 'lucide-react';

const typeIcons = {
  match: <Sparkles size={20} />,
  request: <UserPlus size={20} />,
  message: <MessageCircle size={20} />,
  endorsement: <Award size={20} />,
  review: <CheckCircle size={20} />,
};

const typeColors = {
  match: '#0284c7', // sky blue
  request: '#3b82f6', // blue
  message: '#2563eb', // royal blue
  endorsement: '#0284c7', // sky blue
  review: '#6366f1', // indigo
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications', { timeout: 3000 });
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error(err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const markAllRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      // Manual fallback loop
      for (const n of notifications.filter(notif => !notif.is_read)) {
        try { await API.patch(`/notifications/${n._id || n.id}/read`); } catch (e) {}
      }
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const filtered = filter === 'all' ? notifications : 
    filter === 'unread' ? notifications.filter(n => !n.is_read) : 
    notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const pendingItems = notifications.filter(n => !n.is_read && (n.type === 'request' || n.type === 'match'));

  if (loading) return <div className="page" style={{ textAlign: 'center', paddingTop: '8rem', color: '#94a3b8' }}>Loading notifications...</div>;

  return (
    <div className="page notifications-page">
      <div className="notif-header">
        <div>
          <h3 className="section-header" style={{ marginBottom: '2rem', borderBottom: '2px solid rgba(27, 58, 75, 0.08)', paddingBottom: '0.75rem' }}><Clock size={18} /> Awaiting Decision ({pendingItems.length})</h3>
          <p>{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn-mark-all" onClick={markAllRead}>
            <Check size={16} /> Mark All Read
          </button>
        )}
      </div>

      {/* FILTER PILLS */}
      <div className="notif-filters">
        {['all', 'unread', 'match', 'request', 'message', 'endorsement', 'review'].map(f => (
          <button 
            key={f} 
            className={`notif-filter-pill ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'unread' && unreadCount > 0 && <span className="pill-badge">{unreadCount}</span>}
          </button>
        ))}
      </div>

      {/* NOTIFICATION LIST */}
      <div className="notif-list">
        {filtered.length === 0 ? (
          <div className="notif-empty">
            <BellOff size={48} style={{ opacity: 0.2 }} />
            <p>No notifications to show.</p>
          </div>
        ) : (
          filtered.map(n => (
            <div 
               key={n._id || n.id} 
               className={`notif-item ${n.is_read ? '' : 'unread'}`}
               onClick={() => markAsRead(n._id || n.id)}
            >
              <div className="notif-icon" style={{ background: `${typeColors[n.type] || '#ccc'}15`, color: typeColors[n.type] || '#ccc' }}>
                {typeIcons[n.type] || <Bell size={20} />}
              </div>
              <div className="notif-body">
                <div className="notif-title" style={{ fontWeight: n.is_read ? 700 : 900 }}>{n.title}</div>
                <div className="notif-content">{n.content}</div>
                <div className="notif-time">
                   {timeAgo(n.createdAt)}
                </div>
              </div>
              {!n.is_read && <div className="notif-dot" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;
