import { LayoutDashboard, PlusCircle, Settings } from 'lucide-react';

export const navSections = [
  {
    label: 'Loading',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/new', label: 'New loading request', icon: PlusCircle },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];
