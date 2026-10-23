import { ArrowLeftRight, History, LayoutDashboard, PanelLeft, CreditCard } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { brand, isCurrentPanel, panelOrigin, panels } from '../config/brand';
import { navSections } from '../config/navigation';
import { cx } from '../utils/cx';

const PANEL_ICONS = {
  admin: LayoutDashboard,
  loading: CreditCard,
  history: History,
};

export function AppSidebar({ collapsed, mobileOpen, onNavigate, onToggleCollapse }) {
  return (
    <aside
      className={cx(
        'no-print fixed inset-y-0 left-0 z-40 flex flex-col border-r border-line bg-surface transition-transform lg:translate-x-0',
        collapsed ? 'w-[272px] lg:w-[84px]' : 'w-[272px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
      )}
      aria-label="Primary"
    >
      <div className={cx('flex items-center gap-3 px-4 py-5', collapsed && 'lg:justify-center lg:px-2')}>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand font-serif text-lg text-[rgb(var(--brand-ink))]">F</span>
        <span className={cx('min-w-0', collapsed && 'lg:hidden')}>
          <span className="block text-sm font-semibold">{brand.name}</span>
          <span className="block truncate text-xs text-muted">Transaction Console</span>
        </span>
      </div>

      <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className={cx('eyebrow px-2', collapsed && 'lg:sr-only')}>{section.label}</p>
            <ul className="mt-2 space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      title={item.label}
                      onClick={onNavigate}
                      className={({ isActive }) => cx(
                        'flex items-center gap-3 rounded-control px-2.5 py-2.5 text-sm',
                        isActive ? 'bg-soft font-medium text-ink' : 'text-muted hover:bg-soft hover:text-ink',
                        collapsed && 'lg:justify-center',
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className={cx('min-w-0 flex-1 truncate', collapsed && 'lg:sr-only')}>{item.label}</span>
                      {item.badge ? (
                        <span className={cx('rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900', collapsed && 'lg:hidden')}>
                          {item.badge}
                        </span>
                      ) : null}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div>
          <p className={cx('eyebrow px-2', collapsed && 'lg:sr-only')}>Panels</p>
          <ul className="mt-2 space-y-1">
            {panels.map((panel) => {
              const Icon = PANEL_ICONS[panel.id];
              const current = isCurrentPanel(panel.id);
              const className = cx(
                'flex items-center gap-3 rounded-control px-2.5 py-2.5 text-sm',
                current ? 'bg-soft font-medium text-ink' : 'text-muted hover:bg-soft hover:text-ink',
                collapsed && 'lg:justify-center',
              );
              const content = (
                <>
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className={cx('truncate', collapsed && 'lg:sr-only')}>{panel.label}</span>
                </>
              );
              return (
                <li key={panel.id}>
                  {current ? (
                    <NavLink to="/" end className={className} title={panel.label} onClick={onNavigate}>{content}</NavLink>
                  ) : (
                    <a className={className} href={panelOrigin(panel.id)} title={panel.label}>{content}</a>
                  )}
                </li>
              );
            })}
            <li>
              <NavLink
                to="/planned/transfer"
                title="Transfer/Download Panel, coming in Milestone 2–3"
                onClick={onNavigate}
                className={({ isActive }) => cx(
                  'flex items-center gap-3 rounded-control px-2.5 py-2.5 text-sm',
                  isActive ? 'bg-soft font-medium' : 'text-muted hover:bg-soft hover:text-ink',
                  collapsed && 'lg:justify-center',
                )}
              >
                <ArrowLeftRight className="h-4 w-4 shrink-0" />
                <span className={cx('min-w-0 flex-1', collapsed && 'lg:sr-only')}>
                  <span className="block truncate">Transfer/Download</span>
                  <span className="block text-[10px] uppercase tracking-wide text-amber-800">Coming in Milestone 2–3</span>
                </span>
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>

      <div className="hidden border-t border-line p-3 lg:block">
        <button type="button" className="btn btn-ghost w-full" onClick={onToggleCollapse} aria-pressed={collapsed}>
          <PanelLeft className="h-4 w-4" />
          <span className={cx(collapsed && 'lg:sr-only')}>{collapsed ? 'Expand' : 'Collapse'}</span>
        </button>
      </div>
    </aside>
  );
}
