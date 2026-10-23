import { Bell } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { brand } from '../config/brand';
import { usePreferences } from '../hooks/usePreferences';
import { useSnapshot } from '../hooks/useSnapshot';
import { formatDateTime } from '../utils/format';

const READ_KEY = 'finora.notifications.read';

function readSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

export function NotificationMenu() {
  const { data } = useSnapshot();
  const { prefs } = usePreferences();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(readSet);
  const rootRef = useRef(null);

  const items = useMemo(() => {
    if (!data || !prefs.notifications.inApp) return [];
    const logs = prefs.notifications.connectionAlerts
      ? data.connectionLogs.slice(0, 4).map((log) => ({
        id: log.id,
        title: log.operation,
        detail: `${log.serverName} · ${formatDateTime(log.timestamp)}`,
        to: brand.appId === 'admin' ? '/logs' : '/',
      }))
      : [];
    const records = prefs.notifications.workflowAlerts
      ? data.transactions.slice(0, 4).map((txn) => ({
        id: txn.id,
        title: txn.reference,
        detail: `${txn.transactionType} · ${txn.status} · ${formatDateTime(txn.createdAt)}`,
        to: `/transactions/${txn.reference}`,
      }))
      : [];
    return [...records, ...logs].slice(0, 7);
  }, [data, prefs.notifications]);

  const unread = items.filter((item) => !read.has(item.id)).length;

  useEffect(() => {
    function onPointer(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    function onKey(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  function persist(next) {
    setRead(next);
    localStorage.setItem(READ_KEY, JSON.stringify([...next]));
  }

  function openItem(item) {
    const next = new Set(read);
    next.add(item.id);
    persist(next);
    setOpen(false);
    navigate(item.to);
  }

  function markAll() {
    const next = new Set(read);
    items.forEach((item) => next.add(item.id));
    persist(next);
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="relative rounded-control p-2 text-ink hover:bg-soft"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-700" aria-hidden="true" /> : null}
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-card border border-line bg-surface p-2 shadow-card">
          <div className="flex items-center justify-between px-2 py-1.5">
            <p className="text-sm font-semibold">Notifications</p>
            <button type="button" className="text-xs font-medium text-brand" onClick={markAll}>Mark all read</button>
          </div>
          {!prefs.notifications.inApp ? (
            <p className="px-2 py-4 text-sm leading-6 text-muted">In-app alerts are turned off. You can enable them in Settings.</p>
          ) : items.length === 0 ? (
            <p className="px-2 py-4 text-sm text-muted">No demo alerts yet.</p>
          ) : (
            <ul className="max-h-80 overflow-auto">
              {items.map((item) => (
                <li key={item.id}>
                  <button type="button" role="menuitem" className="w-full rounded-control px-2 py-2 text-left hover:bg-soft" onClick={() => openItem(item)}>
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {!read.has(item.id) ? <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" /> : null}
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-muted">{item.detail}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
