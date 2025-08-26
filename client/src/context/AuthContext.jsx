import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = () => {
      const savedToken = localStorage.getItem('campus_cred_token');
      const savedUser = localStorage.getItem('campus_cred_user');

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user data:', error);
          clearAuth();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      // Save to localStorage
      localStorage.setItem('campus_cred_token', newToken);
      localStorage.setItem('campus_cred_user', JSON.stringify(userData));
      
      // Update state
      setToken(newToken);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;
      
      // Save to localStorage
      localStorage.setItem('campus_cred_token', newToken);
      localStorage.setItem('campus_cred_user', JSON.stringify(newUser));
      
      // Update state
      setToken(newToken);
      setUser(newUser);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    clearAuth();
  };

  const clearAuth = () => {
    localStorage.removeItem('campus_cred_token');
    localStorage.removeItem('campus_cred_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('campus_cred_user', JSON.stringify(updatedUser));
  };

  const refreshProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      const userData = response.data.user;
      updateUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshProfile,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
