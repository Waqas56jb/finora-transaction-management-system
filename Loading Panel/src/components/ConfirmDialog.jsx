import { createPortal } from 'react-dom';
import { useOverlay } from '../hooks/useOverlay';
import { Button } from './Button';

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  busy = false,
  onConfirm,
  onClose,
}) {
  const { ref, onCloseRef } = useOverlay(open);
  onCloseRef.current = onClose;
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-stone-950/40" aria-label="Close dialog" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        tabIndex={-1}
        className="relative z-10 w-full max-w-md rounded-card border border-line bg-surface p-5 shadow-card outline-none"
      >
        <h2 id="confirm-title" className="text-lg font-semibold tracking-tight">{title}</h2>
        <div className="mt-2 text-sm leading-6 text-muted">{body}</div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>{cancelLabel}</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} loading={busy} data-autofocus="true" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
