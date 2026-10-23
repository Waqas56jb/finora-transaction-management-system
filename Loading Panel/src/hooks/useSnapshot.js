import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSnapshot } from '../services/api';

const SnapshotContext = createContext(null);

export function SnapshotProvider({ children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async (options) => {
    const silent = options?.silent;
    if (!silent) setLoading(true);
    try {
      const snapshot = await getSnapshot();
      setData(snapshot);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    const refresh = () => reload({ silent: true });
    window.addEventListener('finora-demo-changed', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('finora-demo-changed', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [reload]);

  const value = useMemo(() => ({ data, error, loading, reload }), [data, error, loading, reload]);
  return createElement(SnapshotContext.Provider, { value }, children);
}

export function useSnapshot() {
  const context = useContext(SnapshotContext);
  if (!context) throw new Error('useSnapshot must be used within SnapshotProvider');
  return context;
}
