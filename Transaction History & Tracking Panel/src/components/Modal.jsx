import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useOverlay } from '../hooks/useOverlay';

export function Modal({ open, title, onClose, children, wide = false }) {
  const { ref, onCloseRef } = useOverlay(open);
  onCloseRef.current = onClose;
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0 bg-stone-950/40" aria-label="Close dialog" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={`relative z-10 max-h-[min(92dvh,820px)] w-full overflow-y-auto rounded-t-card border border-line bg-surface p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-card outline-none sm:rounded-card sm:p-5 ${wide ? 'max-w-3xl' : 'max-w-xl'}`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="modal-title" className="break-words text-lg font-semibold tracking-tight">{title}</h2>
          <button type="button" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-soft" aria-label="Close" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
