import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, ButtonLink } from '../components/Button';
import { Callout } from '../components/DemoBanner';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { PageSkeleton } from '../components/LoadingSkeleton';
import { ReceiptTemplate, SLIP_OPTIONS } from '../components/ReceiptTemplate';
import { useToast } from '../components/ToastProvider';
import { usePreferences } from '../hooks/usePreferences';
import { useTransaction } from '../hooks/useTransaction';
import { refreshReceiptPreview } from '../services/api';
import { downloadText } from '../utils/csv';
import { formatDateTime } from '../utils/format';

export function ReceiptPreview() {
  const { reference = '' } = useParams();
  const { loading, record, error } = useTransaction(reference);
  const { prefs } = usePreferences();
  const toast = useToast();
  const [format, setFormat] = useState('standard');
  const [busy, setBusy] = useState(false);

  function printAs(next) {
    setFormat(next);
    window.setTimeout(() => window.print(), 80);
  }

  function downloadPreview() {
    const node = document.getElementById('receipt-print');
    if (!node) throw new Error('The receipt preview is not ready to download.');
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${record.reference}</title></head><body style="margin:24px;background:#f5f4f2">${node.outerHTML}</body></html>`;
    downloadText(`${record.reference}-${format}.html`, html, 'text/html;charset=utf-8');
    toast.success('Demo preview downloaded as HTML.');
  }

  async function refreshStamp() {
    setBusy(true);
    try {
      await refreshReceiptPreview(record.id);
      toast.success('Preview timestamp updated. The original creation time was not changed.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <PageSkeleton />;
  if (!record) {
    return (
      <EmptyState
        title={error?.code === 'INVALID' ? 'Invalid reference ID' : 'Record not found'}
        description={error?.message || 'Open a demo record before previewing a receipt.'}
        action={<ButtonLink to="/">Back to dashboard</ButtonLink>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="no-print space-y-6">
        <PageHeader
          eyebrow="Demo document"
          title="Receipt and slips"
          description="Previews are marked as demonstrations. They are not valid financial instruments."
          actions={(
            <>
              <Button variant="outline" onClick={() => printAs('standard')}>Print receipt</Button>
              <Button variant="outline" onClick={() => printAs(format === 'standard' ? 'white' : format)}>Print slip</Button>
              <Button variant="secondary" onClick={downloadPreview}>Download HTML</Button>
              <ButtonLink to={`/transactions/${record.reference}`} variant="ghost">Back to transaction details</ButtonLink>
            </>
          )}
        />
        <div className="flex flex-wrap gap-2" aria-label="Preview each color">
          {SLIP_OPTIONS.map(([value, label]) => (
            <Button key={value} variant={format === value ? 'primary' : 'outline'} onClick={() => setFormat(value)}>{label}</Button>
          ))}
        </div>
        <div className="card grid gap-3 p-4 text-sm sm:grid-cols-2">
          <p><span className="text-muted">Original record created:</span> {formatDateTime(record.createdAt)}</p>
          <p><span className="text-muted">Current preview timestamp:</span> {formatDateTime(record.receiptPreviewAt)}</p>
          <div className="sm:col-span-2">
            <Button variant="outline" loading={busy} onClick={refreshStamp}>Refresh preview timestamp</Button>
          </div>
        </div>
      </div>
      <ReceiptTemplate record={record} variant={format} displayName={prefs.displayName} />
      <div className="no-print">
        <Callout tone="neutral" title="Issuer certification">
          Legitimate issuer certification, including any BIN or card-range certificate, must come from the appropriate authorized institution. This demo does not generate certificates, monetary-value statements, or documents that claim a bank has certified a number.
        </Callout>
      </div>
    </div>
  );
}
