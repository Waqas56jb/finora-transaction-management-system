import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { PreferencesProvider } from './hooks/usePreferences';
import { ToastProvider } from './components/ToastProvider';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PreferencesProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </PreferencesProvider>
  </StrictMode>,
);
