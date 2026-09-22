import { createContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';

// 1. Create the Context object
export const AuthContext = createContext();

// 2. Create the Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Validate token on app start or page refresh
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const currentUserData = await authApi.getCurrentUser();
          setUser(currentUserData);
          localStorage.setItem('user', JSON.stringify(currentUserData));
        } catch (error) {
          console.error('Session expired or invalid token:', error);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  // Login handler
  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    
    // Save token and user info
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // Register handler
  const register = async (userData) => {
    const data = await authApi.register(userData);
    
    // Auto-login upon registration
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    role: user?.role || null,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};