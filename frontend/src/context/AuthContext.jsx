import { createContext, useState, useContext, useEffect } from 'react';
import api, { setAuthToken } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('utonga_staff_user');
    const token = localStorage.getItem('utonga_staff_token');

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setAuthToken(token);
    } else {
      setAuthToken(null);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/api/admin/login/', { username, password });
    if (res.data.success) {
      console.log('login response token', res.data.token);
      const userData = {
        username: res.data.username,
        role: res.data.role,
        needsPasswordChange: res.data.needs_password_change
      };
      const token = res.data.token;

      setUser(userData);
      localStorage.setItem('utonga_staff_user', JSON.stringify(userData));
      setAuthToken(token);

      return res.data;
    }
    throw new Error(res.data.error || 'Login failed');
  };

  const logout = async () => {
    try {
      await api.post('/api/admin/logout/');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setAuthToken(null);
      localStorage.removeItem('utonga_staff_user');
    }
  };

  const changePassword = async (new_password, confirm_password) => {
    const res = await api.post('/api/admin/change-password/', { new_password, confirm_password });
    if (res.data.success) {
      const updatedUser = { ...user, needsPasswordChange: false };
      setUser(updatedUser);
      localStorage.setItem('utonga_staff_user', JSON.stringify(updatedUser));
    }
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
