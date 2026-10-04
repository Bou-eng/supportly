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

  const [loading, setLoading] = useState(true);

  // Validate token on app start or page refresh
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const currentUserData = await authApi.getCurrentUser();
        const currentUser = currentUserData.user || currentUserData;
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      } catch (error) {
        setUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    };

    verifyUser();

    const handleSessionExpired = () => {
      setUser(null);
      setLoading(false);
    };
    window.addEventListener('auth:expired', handleSessionExpired);
    return () => window.removeEventListener('auth:expired', handleSessionExpired);
  }, []);

  // Login handler
  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    
    // Save token and user info
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  // Register handler
  const register = async (userData) => {
    const data = await authApi.register(userData);
    
    // Auto-login upon registration
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  // Logout handler
  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    role: user?.role || null,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};