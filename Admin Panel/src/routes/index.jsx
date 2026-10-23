import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { ConnectionLogs } from '../pages/ConnectionLogs';
import { CurrencyManagement } from '../pages/CurrencyManagement';
import { Dashboard } from '../pages/Dashboard';
import { NotFound } from '../pages/NotFound';
import { PlannedTransfer } from '../pages/PlannedTransfer';
import { ProtocolManagement } from '../pages/ProtocolManagement';
import { ReceiptPreview } from '../pages/ReceiptPreview';
import { ServerConfiguration } from '../pages/ServerConfiguration';
import { Settings } from '../pages/Settings';
import { TransactionDetails } from '../pages/TransactionDetails';

const admin = { label: 'Admin', to: '/' };

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard />, handle: { title: 'Dashboard', crumbs: [admin, { label: 'Dashboard' }] } },
      { path: 'servers', element: <ServerConfiguration />, handle: { title: 'Server configuration', crumbs: [admin, { label: 'Server configuration' }] } },
      { path: 'protocols', element: <ProtocolManagement />, handle: { title: 'Protocols', crumbs: [admin, { label: 'Protocols' }] } },
      { path: 'currencies', element: <CurrencyManagement />, handle: { title: 'Currencies', crumbs: [admin, { label: 'Currencies' }] } },
      { path: 'logs', element: <ConnectionLogs />, handle: { title: 'Connection logs', crumbs: [admin, { label: 'Connection logs' }] } },
      { path: 'settings', element: <Settings />, handle: { title: 'Settings', crumbs: [admin, { label: 'Settings' }] } },
      { path: 'transactions/:reference', element: <TransactionDetails />, handle: { title: 'Transaction details', crumbs: [admin, { label: 'Transaction details' }] } },
      { path: 'transactions/:reference/receipt', element: <ReceiptPreview />, handle: { title: 'Receipt preview', crumbs: [admin, { label: 'Receipt preview' }] } },
      { path: 'planned/transfer', element: <PlannedTransfer />, handle: { title: 'Transfer / Download', crumbs: [admin, { label: 'Transfer / Download' }] } },
      { path: '*', element: <NotFound />, handle: { title: 'Not found', crumbs: [admin, { label: 'Not found' }] } },
    ],
  },
]);
