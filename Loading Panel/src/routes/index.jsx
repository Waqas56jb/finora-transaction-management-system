import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { Dashboard } from '../pages/Dashboard';
import { NewLoadingRequest } from '../pages/NewLoadingRequest';
import { NotFound } from '../pages/NotFound';
import { PlannedTransfer } from '../pages/PlannedTransfer';
import { ReceiptPreview } from '../pages/ReceiptPreview';
import { Settings } from '../pages/Settings';
import { TransactionDetails } from '../pages/TransactionDetails';

const root = { label: 'Loading', to: '/' };

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard />, handle: { title: 'Loading dashboard', crumbs: [root, { label: 'Dashboard' }] } },
      { path: 'new', element: <NewLoadingRequest />, handle: { title: 'New loading request', crumbs: [root, { label: 'New loading request' }] } },
      { path: 'settings', element: <Settings />, handle: { title: 'Settings', crumbs: [root, { label: 'Settings' }] } },
      { path: 'transactions/:reference', element: <TransactionDetails />, handle: { title: 'Transaction details', crumbs: [root, { label: 'Transaction details' }] } },
      { path: 'transactions/:reference/receipt', element: <ReceiptPreview />, handle: { title: 'Receipt preview', crumbs: [root, { label: 'Receipt preview' }] } },
      { path: 'planned/transfer', element: <PlannedTransfer />, handle: { title: 'Transfer / Download', crumbs: [root, { label: 'Transfer / Download' }] } },
      { path: '*', element: <NotFound />, handle: { title: 'Not found', crumbs: [root, { label: 'Not found' }] } },
    ],
  },
]);
