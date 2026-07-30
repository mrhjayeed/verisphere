import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('verisphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('verisphere_token', token);
    localStorage.setItem('verisphere_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const signup = async (username, password, displayName) => {
    const res = await api.post('/auth/signup', { username, password, displayName });
    const { token, user: userData } = res.data;
    localStorage.setItem('verisphere_token', token);
    localStorage.setItem('verisphere_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('verisphere_token');
    localStorage.removeItem('verisphere_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
