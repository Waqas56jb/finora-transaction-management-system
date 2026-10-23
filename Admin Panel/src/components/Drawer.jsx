import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useOverlay } from '../hooks/useOverlay';

export function Drawer({ open, title, onClose, children }) {
  const { ref, onCloseRef } = useOverlay(open);
  onCloseRef.current = onClose;
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[65]">
      <button type="button" className="absolute inset-0 bg-stone-950/40" aria-label="Close panel" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-line bg-surface shadow-card outline-none"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <h2 id="drawer-title" className="text-lg font-semibold tracking-tight">{title}</h2>
          <button type="button" className="rounded-lg p-2 text-muted hover:bg-soft" aria-label="Close" data-autofocus="true" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
