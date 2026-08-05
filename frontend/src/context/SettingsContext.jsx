import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/settings/');

      // Transform list [ {key: "...", value: "..."} ] into object { key: value }
      const settingsMap = Array.isArray(res.data)
        ? res.data.reduce((acc, s) => {
            acc[s.key] = s.value;
            return acc;
          }, {})
        : {};

      setSettings(settingsMap);
    } catch (err) {
      console.error('Failed to fetch platform settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // Refresh settings every 30 seconds to stay in sync with administrative changes
    const interval = setInterval(fetchSettings, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
