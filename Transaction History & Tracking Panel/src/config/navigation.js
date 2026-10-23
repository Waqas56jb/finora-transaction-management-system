import { History, LayoutDashboard, Settings } from 'lucide-react';

export const navSections = [
  {
    label: 'Tracking',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/history', label: 'Transaction history', icon: History },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];
