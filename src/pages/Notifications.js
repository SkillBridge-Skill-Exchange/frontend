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
import './notifications.css';

const typeIcons = {
  match: <Sparkles size={20} />,
  request: <UserPlus size={20} />,
  message: <MessageCircle size={20} />,
  endorsement: <Award size={20} />,
  review: <CheckCircle size={20} />,
};

const typeColors = {
  match: '#8b5cf6',
  request: '#f59e0b',
  message: '#2b6777',
  endorsement: '#52ab98',
  review: '#ec4899',
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
    } catch (err) {}
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    for (const n of notifications.filter(n => !n.is_read)) {
      try { await API.patch(`/notifications/${n.id}/read`); } catch (err) {}
    }
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
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

  if (loading) return <div className="page" style={{ textAlign: 'center', paddingTop: '8rem', color: '#94a3b8' }}>Loading notifications...</div>;

  return (
    <div className="page notifications-page">
      <div className="notif-header">
        <div>
          <h1><Bell size={32} /> Notifications</h1>
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
              key={n.id} 
              className={`notif-item ${n.is_read ? '' : 'unread'}`}
              onClick={() => markAsRead(n.id)}
            >
              <div className="notif-icon" data-type={n.type}>
                {typeIcons[n.type] || <Bell size={20} />}
              </div>
              <div className="notif-body">
                <div className="notif-title">{n.title}</div>
                <div className="notif-content">{n.content}</div>
                <div className="notif-time">
                  <Clock size={12} /> {timeAgo(n.createdAt)}
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
