import { applyMethod, createInitialState } from './storeCore';

const RPC_PATH = '/__finora/rpc';
const LOCAL_KEY = 'finora.demo.store.v1';

const MUTATIONS = new Set([
  'createDemoTransaction',
  'updateDemoTransaction',
  'cancelDemoTransaction',
  'refreshReceiptPreview',
  'generateDemoReference',
  'createServerProfile',
  'updateServerProfile',
  'deleteServerProfile',
  'testDemoConnection',
  'updateProtocol',
  'updateCurrency',
]);

function loadLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw);
    return parsed?.version ? parsed : createInitialState();
  } catch {
    return createInitialState();
  }
}

function localRpc(method, payload) {
  const state = loadLocal();
  const result = applyMethod(state, method, payload);
  if (result.mutate) localStorage.setItem(LOCAL_KEY, JSON.stringify(result.state));
  return result.data;
}

function fromLocalStore(method, payload) {
  const data = localRpc(method, payload);
  if (MUTATIONS.has(method)) window.dispatchEvent(new CustomEvent('finora-demo-changed'));
  return data;
}

export async function rpc(method, payload) {
  let response;
  try {
    response = await fetch(RPC_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ method, payload: payload ?? {} }),
    });
  } catch {
    return fromLocalStore(method, payload);
  }

  const contentType = response.headers.get('content-type') || '';
  const jsonResponse = contentType.includes('application/json');
  if (response.status === 404 || !jsonResponse) {
    return fromLocalStore(method, payload);
  }

  const body = await response.json().catch(() => null);
  if (!body || typeof body.ok !== 'boolean') {
    return fromLocalStore(method, payload);
  }
  if (!response.ok) {
    throw new Error(body?.error?.message || 'The demo service is unavailable.');
  }
  if (!body.ok) {
    const error = new Error(body.error?.message || 'The demo operation could not be completed.');
    error.code = body.error?.code;
    error.fields = body.error?.fields || null;
    throw error;
  }
  if (MUTATIONS.has(method)) window.dispatchEvent(new CustomEvent('finora-demo-changed'));
  return body.data;
}

export const getSnapshot = () => rpc('getSnapshot');
export const getTransactions = () => rpc('getTransactions');
export const getTransactionById = (id) => rpc('getTransactionById', { id });
export const searchTransactions = (query) => rpc('searchTransactions', typeof query === 'string' ? { query } : query || {});
export const createDemoTransaction = (payload) => rpc('createDemoTransaction', payload);
export const updateDemoTransaction = (id, updates) => rpc('updateDemoTransaction', { id, ...updates });
export const cancelDemoTransaction = (id) => rpc('cancelDemoTransaction', { id });
export const refreshReceiptPreview = (id) => rpc('refreshReceiptPreview', { id });
export const generateDemoReference = (id) => rpc('generateDemoReference', { id });
export const getServerProfiles = () => rpc('getServerProfiles');
export const createServerProfile = (payload) => rpc('createServerProfile', payload);
export const updateServerProfile = (id, updates) => rpc('updateServerProfile', { id, ...updates });
export const deleteServerProfile = (id) => rpc('deleteServerProfile', { id });
export const testDemoConnection = (id) => rpc('testDemoConnection', { id });
export const getProtocols = () => rpc('getProtocols');
export const updateProtocol = (id, updates) => rpc('updateProtocol', { id, ...updates });
export const getCurrencies = () => rpc('getCurrencies');
export const updateCurrency = (code, updates) => rpc('updateCurrency', { code, ...updates });
export const getConnectionLogs = (filters) => rpc('getConnectionLogs', filters || {});

export function exportTransactionsToCsv(records) {
  return records || [];
}
