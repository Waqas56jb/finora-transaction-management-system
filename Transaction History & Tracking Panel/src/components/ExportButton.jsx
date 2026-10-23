import { useState } from 'react';
import { Button } from './Button';
import { useToast } from './ToastProvider';

export function ExportButton({ onExport, disabled, children = 'Export filtered CSV' }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function handle() {
    try {
      setBusy(true);
      await onExport();
      toast.success('Export completed. The file contains demo fields only.');
    } catch (error) {
      toast.error(error.message || 'Export failed. Nothing was downloaded.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="outline" loading={busy} disabled={disabled} onClick={handle}>
      {children}
    </Button>
  );
}
