import { Menu, Moon, Sun } from 'lucide-react';
import { Link, useMatches } from 'react-router-dom';
import { usePreferences } from '../hooks/usePreferences';
import { NotificationMenu } from './NotificationMenu';
import { ProfileMenu } from './ProfileMenu';
import { SearchMenu } from './SearchMenu';

export function AppHeader({ onMenu }) {
  const matches = useMatches();
  const handle = [...matches].reverse().find((match) => match.handle?.title)?.handle;
  const { prefs, update } = usePreferences();
  const crumbs = handle?.crumbs || [{ label: handle?.title || 'Finora' }];

  return (
    <header className="no-print sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
        <button type="button" className="rounded-control p-2 hover:bg-soft lg:hidden" aria-label="Open navigation" onClick={onMenu}>
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <nav aria-label="Breadcrumb" className="truncate text-sm text-muted">
            <ol className="flex items-center gap-1">
              {crumbs.map((crumb, index) => (
                <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1">
                  {index > 0 ? <span aria-hidden="true">/</span> : null}
                  {crumb.to && index < crumbs.length - 1 ? (
                    <Link to={crumb.to} className="truncate hover:text-ink">{crumb.label}</Link>
                  ) : (
                    <span className="truncate font-medium text-ink" aria-current="page">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
        <div className="hidden w-72 md:block">
          <SearchMenu id="quick-search" />
        </div>
        <button
          type="button"
          className="rounded-control p-2 hover:bg-soft"
          aria-label={prefs.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={() => update({ theme: prefs.theme === 'dark' ? 'light' : 'dark' })}
        >
          {prefs.theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <NotificationMenu />
        <ProfileMenu />
      </div>
      <div className="px-4 pb-3 md:hidden">
        <SearchMenu id="quick-search-mobile" />
      </div>
    </header>
  );
}
