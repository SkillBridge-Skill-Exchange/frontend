/**
 * Notification Context
 * Manages toast notifications across the app
 */

import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      type: notification.type || 'default',
      title: notification.title,
      message: notification.message,
      duration: notification.duration || 5000
    };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Helper methods for different notification types
  const showMatch = (message) => {
    addNotification({
      type: 'match',
      title: 'New Match Found!',
      message
    });
  };

  const showRequest = (message) => {
    addNotification({
      type: 'request',
      title: 'Collaboration Request',
      message
    });
  };

  const showMessage = (message) => {
    addNotification({
      type: 'message',
      title: 'New Message',
      message
    });
  };

  const showEndorsement = (message) => {
    addNotification({
      type: 'endorsement',
      title: 'New Endorsement',
      message
    });
  };

  const showReview = (message) => {
    addNotification({
      type: 'review',
      title: 'New Review',
      message
    });
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showMatch,
    showRequest,
    showMessage,
    showEndorsement,
    showReview
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
