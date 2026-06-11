import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for active token on load and fetch fresh user profile
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('mantech_token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await API.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Session validation failed:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const response = await API.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user: userData } = response.data;
        localStorage.setItem('mantech_token', token);
        localStorage.setItem('mantech_user', JSON.stringify(userData));
        setUser(userData);
        setLoading(false);
        return userData;
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Authentication failed. Please verify credentials.';
      setError(errMsg);
      setLoading(false);
      throw new Error(errMsg);
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    setLoading(true);
    try {
      const response = await API.post('/auth/register', { name, email, password });
      if (response.data.success) {
        const { token, user: userData } = response.data;
        localStorage.setItem('mantech_token', token);
        localStorage.setItem('mantech_user', JSON.stringify(userData));
        setUser(userData);
        setLoading(false);
        return userData;
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Registration failed. Please check credentials.';
      setError(errMsg);
      setLoading(false);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('mantech_token');
    localStorage.removeItem('mantech_user');
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
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
