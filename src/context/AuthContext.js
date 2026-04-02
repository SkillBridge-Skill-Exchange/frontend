import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const safeParse = (key) => {
    try {
      const item = localStorage.getItem(key);
      if (!item || item === 'undefined') return null;
      return JSON.parse(item);
    } catch (e) {
      return null;
    }
  };

  const getValidToken = () => {
    const t = localStorage.getItem('token');
    return (!t || t === 'undefined' || t === 'null') ? null : t;
  };

  const [token, setToken] = useState(getValidToken());
  const [user, setUser] = useState(safeParse('user'));

  // Ensure invalid states auto-logout
  useEffect(() => {
    if (token && !user) {
      logout();
    }
  }, [token, user]);

  const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
