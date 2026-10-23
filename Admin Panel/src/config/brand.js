import { appIdentity } from './app';

export const brand = {
  name: 'Finora',
  product: 'Finora Transaction Console',
  ...appIdentity,
};

export const panels = [
  {
    id: 'admin',
    label: 'Admin Panel',
    port: 5173,
    description: 'Configuration, protocols, currencies, and connection logs.',
  },
  {
    id: 'loading',
    label: 'Loading Panel',
    port: 5174,
    description: 'Prepare and review simulated load and unload requests.',
  },
  {
    id: 'history',
    label: 'Transaction History & Tracking Panel',
    port: 5175,
    description: 'Search, filter, track, and export demo records.',
  },
];

const productionOrigins = {
  admin: 'https://finora-admin-panel.vercel.app',
  loading: 'https://finora-loading-panel.vercel.app',
  history: 'https://finora-history-panel.vercel.app',
};

export function panelOrigin(id) {
  const onLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  if (onLocalhost) {
    const panel = panels.find((item) => item.id === id);
    return `http://localhost:${panel.port}`;
  }
  return productionOrigins[id];
}

export function isCurrentPanel(id) {
  return id === brand.appId;
}
