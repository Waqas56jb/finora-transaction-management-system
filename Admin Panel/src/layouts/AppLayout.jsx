import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { AppSidebar } from '../components/AppSidebar';
import { DemoBanner } from '../components/DemoBanner';
import { SnapshotProvider } from '../hooks/useSnapshot';

const COLLAPSE_KEY = 'finora.sidebar.collapsed';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, String(collapsed));
  }, [collapsed]);

  return (
    <SnapshotProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[90] focus:rounded-control focus:bg-surface focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="min-h-dvh bg-canvas pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        {mobileOpen ? (
          <button type="button" className="no-print fixed inset-0 z-30 bg-stone-950/40 lg:hidden" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
        ) : null}
        <AppSidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onNavigate={() => setMobileOpen(false)}
          onToggleCollapse={() => setCollapsed((value) => !value)}
        />
        <div className={`min-w-0 ${collapsed ? 'lg:pl-[84px]' : 'lg:pl-[272px]'}`}>
          <div className="no-print sticky top-0 z-30 bg-amber-50 pt-[env(safe-area-inset-top)]">
            <DemoBanner />
            <AppHeader onMenu={() => setMobileOpen(true)} />
          </div>
          <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] outline-none sm:px-5 lg:px-6 lg:py-8">
            <div className="rise">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SnapshotProvider>
  );
}
