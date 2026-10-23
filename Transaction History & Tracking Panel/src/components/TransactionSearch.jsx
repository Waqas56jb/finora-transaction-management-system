import { Search, X } from 'lucide-react';

export function TransactionSearch({ value, onChange, onClear }) {
  return (
    <div className="relative">
      <label htmlFor="history-search" className="sr-only">Search demo records by reference, account label, or protocol</label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        id="history-search"
        className="field pl-9 pr-10"
        value={value}
        autoComplete="off"
        placeholder="Search reference, account label, or protocol"
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted hover:bg-soft" aria-label="Clear search" onClick={onClear}>
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
