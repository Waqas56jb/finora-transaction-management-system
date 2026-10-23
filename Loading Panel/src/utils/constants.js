export const FAMILIES = [
  { id: 'online', label: 'Online', hint: 'Project-defined 101-series identifiers' },
  { id: 'offline', label: 'Offline', hint: 'Project-defined 201-series identifiers' },
  { id: 'proprietary', label: 'Proprietary', hint: 'Messaging standards pending backend support' },
];

export const FAMILY_LABEL = Object.fromEntries(FAMILIES.map((item) => [item.id, item.label]));

export const TRANSACTION_TYPES = [
  { id: 'load', label: 'Load' },
  { id: 'unload', label: 'Unload' },
];

export const ACCOUNT_TYPES = [
  { id: 'card', label: 'Card' },
  { id: 'bank', label: 'Bank account' },
  { id: 'wallet', label: 'Wallet account' },
];

export const ACCOUNT_LABEL = Object.fromEntries(ACCOUNT_TYPES.map((item) => [item.id, item.label]));

export const TYPE_LABEL = Object.fromEntries(TRANSACTION_TYPES.map((item) => [item.id, item.label]));

export const SERVER_TYPES = [
  { id: 'online', label: 'Online Protocol Server' },
  { id: 'offline', label: 'Offline Protocol Server' },
  { id: 'proprietary', label: 'Proprietary Protocol Server' },
];

export const ENVIRONMENTS = ['Demo', 'Not Connected'];

export const SERVER_STATUSES = [
  { id: 'connected_demo', label: 'Connected (Demo)' },
  { id: 'disconnected', label: 'Disconnected' },
  { id: 'pending', label: 'Pending' },
  { id: 'error', label: 'Error' },
];

export const COUNTRIES = [
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'CA', label: 'Canada' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'AE', label: 'United Arab Emirates' },
  { code: 'PK', label: 'Pakistan' },
  { code: 'IN', label: 'India' },
];

export const WALLET_NETWORKS = ['Demo ledger', 'Sample network', 'Not applicable'];

export const REF_PATTERN = /^DEMO-TXN-\d{4}-\d{6}$/;

export const PAGE_SIZE_OPTIONS = [5, 8, 10, 20];

export const CHART_COLORS = {
  primary: '#1e3a5f',
  green: '#0f7b4c',
  amber: '#b45309',
  red: '#b42318',
  slate: '#78716c',
  grid: '#e7e5e4',
  gridDark: '#3f3f46',
};
