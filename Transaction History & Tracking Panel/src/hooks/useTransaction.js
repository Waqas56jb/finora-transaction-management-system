import { useCallback, useEffect, useState } from 'react';
import { getTransactionById } from '../services/api';
import { REF_PATTERN } from '../utils/constants';

export function useTransaction(reference) {
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async (silent) => {
    if (!REF_PATTERN.test(reference || '')) {
      setLoading(false);
      setRecord(null);
      const invalid = new Error('That reference ID is not a Finora demo reference. Use a value such as DEMO-TXN-2026-000001.');
      invalid.code = 'INVALID';
      setError(invalid);
      return;
    }
    if (!silent) setLoading(true);
    try {
      const next = await getTransactionById(reference);
      setRecord(next);
      setError(null);
    } catch (err) {
      setRecord(null);
      setError(err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [reference]);

  useEffect(() => {
    load(false);
  }, [load]);

  useEffect(() => {
    const refresh = () => load(true);
    window.addEventListener('finora-demo-changed', refresh);
    return () => window.removeEventListener('finora-demo-changed', refresh);
  }, [load]);

  return { loading, record, error, reload: () => load(false) };
}
