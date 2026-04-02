/**
 * NotificationToast Component
 * Real-time notification popups for matches, requests, etc.
 */

import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, UserPlus, MessageCircle, Award, 
  CheckCircle, Bell 
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import './NotificationToast.css';

const typeConfig = {
  match: {
    icon: <Sparkles size={20} />,
    gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    bg: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
    color: '#8b5cf6'
  },
  request: {
    icon: <UserPlus size={20} />,
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    bg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    color: '#f59e0b'
  },
  message: {
    icon: <MessageCircle size={20} />,
    gradient: 'linear-gradient(135deg, #2b6777, #1e40af)',
    bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    color: '#2b6777'
  },
  endorsement: {
    icon: <Award size={20} />,
    gradient: 'linear-gradient(135deg, #52ab98, #059669)',
    bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
    color: '#059669'
  },
  review: {
    icon: <CheckCircle size={20} />,
    gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
    bg: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
    color: '#ec4899'
  },
  default: {
    icon: <Bell size={20} />,
    gradient: 'linear-gradient(135deg, #64748b, #475569)',
    bg: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
    color: '#64748b'
  }
};

function NotificationToast({ notification, onClose }) {
  const [isExiting, setIsExiting] = useState(false);
  const config = typeConfig[notification.type] || typeConfig.default;

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, notification.duration || 5000);

    return () => clearTimeout(timer);
  }, [notification.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  };

  return (
    <div className={`toast-notification ${isExiting ? 'toast-exit' : ''}`}>
      <div className="toast-icon-wrapper" style={{ background: config.bg }}>
        <div className="toast-icon" style={{ color: config.color }}>
          {config.icon}
        </div>
      </div>
      
      <div className="toast-content">
        <div className="toast-title">{notification.title}</div>
        <div className="toast-message">{notification.message}</div>
      </div>

      <button className="toast-close" onClick={handleClose}>
        <X size={18} />
      </button>

      <div className="toast-progress" style={{ background: config.gradient }} />
    </div>
  );
}

function NotificationToastContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="toast-container">
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
}

export { NotificationToast, NotificationToastContainer };
export default NotificationToastContainer;
