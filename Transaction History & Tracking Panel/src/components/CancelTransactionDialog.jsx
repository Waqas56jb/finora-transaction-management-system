import { ConfirmDialog } from './ConfirmDialog';
import { StatusBadge } from './StatusBadge';

export function CancelTransactionDialog({ record, open, busy, onConfirm, onClose }) {
  if (!record) return null;
  return (
    <ConfirmDialog
      open={open}
      title="Cancel this demo record?"
      tone="danger"
      confirmLabel="Cancel demo record"
      busy={busy}
      onConfirm={onConfirm}
      onClose={onClose}
      body={(
        <div className="space-y-3">
          <p>This updates the local demo dataset only. It does not cancel, reverse, or settle a real payment.</p>
          <p><span className="font-medium text-ink">Reference:</span> {record.reference}</p>
          <StatusBadge status={record.status} />
        </div>
      )}
    />
  );
}
