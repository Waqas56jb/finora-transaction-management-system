import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { brand } from '../config/brand';
import { useSnapshot } from '../hooks/useSnapshot';

export function SearchMenu({ id = 'quick-search' }) {
  const { data } = useSnapshot();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2 || !data) return [];
    const transactions = data.transactions
      .filter((item) => [item.reference, item.account?.displayLabel, item.protocolIdentifier, item.account?.maskedIdentifier]
        .join(' ')
        .toLowerCase()
        .includes(term))
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        label: item.reference,
        detail: `${item.protocolIdentifier} · ${item.account?.displayLabel || item.accountType}`,
        to: `/transactions/${item.reference}`,
      }));
    const servers = brand.appId === 'admin'
      ? data.serverProfiles
        .filter((item) => item.name.toLowerCase().includes(term))
        .slice(0, 3)
        .map((item) => ({ id: item.id, label: item.name, detail: 'Server profile', to: '/servers' }))
      : [];
    const protocols = brand.appId === 'admin'
      ? data.protocols
        .filter((item) => `${item.identifier} ${item.name}`.toLowerCase().includes(term))
        .slice(0, 3)
        .map((item) => ({ id: item.id, label: item.identifier, detail: item.name, to: '/protocols' }))
      : [];
    return [...transactions, ...servers, ...protocols];
  }, [data, query]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    function onPointer(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    function onKey(event) {
      const target = event.target;
      const typing = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if (event.key === '/' && !typing && inputRef.current?.getClientRects().length) {
        event.preventDefault();
        inputRef.current.focus();
      }
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  function choose(item) {
    if (!item) return;
    setOpen(false);
    setQuery('');
    navigate(item.to);
  }

  function onKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => Math.min(results.length - 1, index + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => Math.max(0, index - 1));
    } else if (event.key === 'Enter' && results[active]) {
      event.preventDefault();
      choose(results[active]);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <label htmlFor={id} className="sr-only">Search demo records</label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        ref={inputRef}
        id={id}
        className="field pl-9"
        placeholder="Search demo records"
        value={query}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {open && query.trim().length >= 2 ? (
        <ul id={`${id}-list`} role="listbox" className="absolute z-50 mt-2 max-h-80 w-full overflow-auto rounded-card border border-line bg-surface p-1 shadow-card">
          {results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted">No demo records match that search.</li>
          ) : results.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                aria-selected={index === active}
                className={`w-full rounded-control px-3 py-2 text-left ${index === active ? 'bg-soft' : 'hover:bg-soft'}`}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(item)}
              >
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="block text-xs text-muted">{item.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
