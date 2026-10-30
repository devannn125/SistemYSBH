import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('simsbh_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('simsbh_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/me')
        .then((res) => {
          setUser(res.user);
          localStorage.setItem('simsbh_user', JSON.stringify(res.user));
        })
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem('simsbh_token');
          localStorage.removeItem('simsbh_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    const res = await api.post('/login', { username, password });
    localStorage.setItem('simsbh_token', res.token);
    localStorage.setItem('simsbh_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      // Ignore error on logout
    } finally {
      localStorage.removeItem('simsbh_token');
      localStorage.removeItem('simsbh_user');
      setToken(null);
      setUser(null);
      window.location.href = '/login';
    }
  };

  const hasRole = (roleName) => {
    if (!user) return false;
    return user.roles?.includes(roleName) || false;
  };

  const hasPermission = (permissionName) => {
    if (!user) return false;
    return user.permissions?.includes(permissionName) || false;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

