import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { Dashboard } from '../pages/Dashboard';
import { NotFound } from '../pages/NotFound';
import { PlannedTransfer } from '../pages/PlannedTransfer';
import { ReceiptPreview } from '../pages/ReceiptPreview';
import { Settings } from '../pages/Settings';
import { TransactionDetails } from '../pages/TransactionDetails';
import { TransactionHistory } from '../pages/TransactionHistory';

const root = { label: 'History', to: '/' };

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard />, handle: { title: 'Tracking dashboard', crumbs: [root, { label: 'Dashboard' }] } },
      { path: 'history', element: <TransactionHistory />, handle: { title: 'Transaction history', crumbs: [root, { label: 'Transaction history' }] } },
      { path: 'settings', element: <Settings />, handle: { title: 'Settings', crumbs: [root, { label: 'Settings' }] } },
      { path: 'transactions/:reference', element: <TransactionDetails />, handle: { title: 'Transaction details', crumbs: [root, { label: 'Transaction details' }] } },
      { path: 'transactions/:reference/receipt', element: <ReceiptPreview />, handle: { title: 'Receipt preview', crumbs: [root, { label: 'Receipt preview' }] } },
      { path: 'planned/transfer', element: <PlannedTransfer />, handle: { title: 'Transfer / Download', crumbs: [root, { label: 'Transfer / Download' }] } },
      { path: '*', element: <NotFound />, handle: { title: 'Not found', crumbs: [root, { label: 'Not found' }] } },
    ],
  },
]);
