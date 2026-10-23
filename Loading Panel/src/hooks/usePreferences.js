import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'finora.ui.prefs.v1';

export const preferenceDefaults = {
  displayName: 'Finora Transaction Console',
  operatorName: 'Avery Quinn',
  operatorRole: 'Operations preview',
  currency: 'USD',
  theme: 'light',
  pageSize: 8,
  notifications: {
    inApp: true,
    connectionAlerts: true,
    workflowAlerts: true,
  },
};

const PreferencesContext = createContext(null);

function readPrefs() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return preferenceDefaults;
    const parsed = JSON.parse(raw);
    return {
      ...preferenceDefaults,
      ...parsed,
      notifications: { ...preferenceDefaults.notifications, ...(parsed.notifications || {}) },
    };
  } catch {
    return preferenceDefaults;
  }
}

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(readPrefs);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', prefs.theme === 'dark');
    document.documentElement.style.colorScheme = prefs.theme === 'dark' ? 'dark' : 'light';
    const theme = document.querySelector('meta[name="theme-color"]');
    if (theme) theme.setAttribute('content', prefs.theme === 'dark' ? '#111316' : '#f5f4f2');
    localStorage.setItem(KEY, JSON.stringify(prefs));
  }, [prefs]);

  const update = useCallback((patch) => {
    setPrefs((current) => ({
      ...current,
      ...patch,
      notifications: patch.notifications
        ? { ...current.notifications, ...patch.notifications }
        : current.notifications,
    }));
  }, []);

  const value = useMemo(() => ({ prefs, update }), [prefs, update]);
  return createElement(PreferencesContext.Provider, { value }, children);
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used within PreferencesProvider');
  return context;
}
