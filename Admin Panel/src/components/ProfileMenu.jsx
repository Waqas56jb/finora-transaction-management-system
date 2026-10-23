import { LogOut, Moon, Settings, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../hooks/usePreferences';
import { initials } from '../utils/format';
import { Modal } from './Modal';

export function ProfileMenu() {
  const { prefs, update } = usePreferences();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const rootRef = useRef(null);

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

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-control py-1 pl-1 pr-2 hover:bg-soft"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open profile menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-xs font-semibold text-[rgb(var(--brand-ink))]">
          {initials(prefs.operatorName)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium leading-4">{prefs.operatorName}</span>
          <span className="block text-xs text-muted">{prefs.operatorRole}</span>
        </span>
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-64 rounded-card border border-line bg-surface p-2 shadow-card">
          <p className="px-2 py-2 text-xs leading-5 text-muted">Local preview identity. Milestone 1 does not include sign-in.</p>
          <button type="button" role="menuitem" className="flex w-full items-center gap-2 rounded-control px-2 py-2 text-sm hover:bg-soft" onClick={() => { setOpen(false); navigate('/settings'); }}>
            <Settings className="h-4 w-4" /> Settings
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-control px-2 py-2 text-sm hover:bg-soft"
            onClick={() => update({ theme: prefs.theme === 'dark' ? 'light' : 'dark' })}
          >
            {prefs.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            Use {prefs.theme === 'dark' ? 'light' : 'dark'} theme
          </button>
          <button type="button" role="menuitem" className="flex w-full items-center gap-2 rounded-control px-2 py-2 text-sm hover:bg-soft" onClick={() => { setOpen(false); setSignOutOpen(true); }}>
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      ) : null}
      <Modal open={signOutOpen} title="No sign-in session" onClose={() => setSignOutOpen(false)}>
        <p className="text-sm leading-6 text-muted">
          Authentication is not part of Milestone 1. This preview stays on this device, and no credentials are stored.
        </p>
        <button type="button" className="btn btn-primary mt-4" onClick={() => setSignOutOpen(false)}>Continue preview</button>
      </Modal>
    </div>
  );
}
