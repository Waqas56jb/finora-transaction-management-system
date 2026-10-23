import { Coins, LayoutDashboard, ScrollText, Server, Settings, Waypoints } from 'lucide-react';

export const navSections = [
  {
    label: 'Monitor',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/logs', label: 'Connection Logs', icon: ScrollText },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { to: '/servers', label: 'Server Profiles', icon: Server },
      { to: '/protocols', label: 'Protocols', icon: Waypoints },
      { to: '/currencies', label: 'Currencies', icon: Coins },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];
