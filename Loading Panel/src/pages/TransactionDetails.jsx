import { useState } from 'react';
import { Link } from 'react-router-dom';
import { brand, panelOrigin } from '../config/brand';
import { Button, ButtonLink } from '../components/Button';
import { Callout } from '../components/DemoBanner';
import { CancelTransactionDialog } from '../components/CancelTransactionDialog';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { PageSkeleton } from '../components/LoadingSkeleton';
import { ReceiptTemplate } from '../components/ReceiptTemplate';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../components/ToastProvider';
import { TransactionTimeline } from '../components/TransactionTimeline';
import { usePreferences } from '../hooks/usePreferences';
import { useTransaction } from '../hooks/useTransaction';
import { cancelDemoTransaction, generateDemoReference } from '../services/api';
import { ACCOUNT_LABEL, FAMILY_LABEL, TYPE_LABEL } from '../utils/constants';
import { formatDateTime, formatMoney } from '../utils/format';
import { useParams } from 'react-router-dom';

export function TransactionDetails() {
  const { reference = '' } = useParams();
  const { loading, record, error } = useTransaction(reference);
  const { prefs } = usePreferences();
  const toast = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function copyRef() {
    try {
      await navigator.clipboard.writeText(record.reference);
      toast.success('Reference ID copied.');
    } catch {
      toast.error('The reference could not be copied.');
    }
  }

  async function cancelRecord() {
    setBusy(true);
    try {
      await cancelDemoTransaction(record.id);
      toast.success('Demo record cancelled.');
      setCancelOpen(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function generateCode() {
    setBusy(true);
    try {
      await generateDemoReference(record.id);
      toast.success('Demo reference created. It is not a banking approval code.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <PageSkeleton />;
  if (!record) {
    const invalid = error?.code === 'INVALID';
    return (
      <EmptyState
        title={invalid ? 'Invalid reference ID' : 'Record not found'}
        description={error?.message || 'That demo reference is not in the local dataset.'}
        action={<ButtonLink to={brand.appId === 'history' ? '/history' : '/'}>{brand.appId === 'history' ? 'Back to history' : 'Back to dashboard'}</ButtonLink>}
      />
    );
  }

  const home = brand.appId === 'history' ? '/history' : '/';
  const homeLabel = brand.appId === 'loading' ? 'Return to Loading Dashboard' : brand.appId === 'history' ? 'Back to history' : 'Return to dashboard';
  const canCancel = brand.appId === 'history' && ['pending', 'completed'].includes(record.status);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Demo record"
        title={record.reference}
        description="Local demonstration data. The status describes this record only."
        actions={(
          <>
            <Button variant="outline" onClick={copyRef}>Copy reference ID</Button>
            <Button variant="outline" onClick={() => window.print()}>Print summary</Button>
            <ButtonLink to={`/transactions/${record.reference}/receipt`} variant="secondary">View receipt</ButtonLink>
            <ButtonLink to={home} variant="ghost">{homeLabel}</ButtonLink>
          </>
        )}
      />
      <Callout tone="warning" title="Local demo dataset">
        The fields below come from the shared demonstration store. They are not a bank statement, a card-network result, or proof that funds moved.
      </Callout>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <section id="print-summary" className="card space-y-5 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={record.status} />
            <span className="badge badge-neutral">{TYPE_LABEL[record.transactionType]}</span>
            <span className="badge badge-info">Demo</span>
          </div>
          <p className="text-3xl font-semibold tabular-nums tracking-tight">{formatMoney(record.amount, record.currency)}</p>
          <dl className="grid gap-4 sm:grid-cols-2 text-sm">
            <Item label="Transaction type" value={TYPE_LABEL[record.transactionType]} />
            <Item label="Account type" value={ACCOUNT_LABEL[record.accountType]} />
            <Item label="Server profile" value={record.serverProfileName} />
            <Item label="Environment" value={record.environmentLabel} />
            <Item label="Protocol family" value={FAMILY_LABEL[record.protocolFamily] || record.protocolFamily} />
            <Item label="Protocol identifier" value={record.protocolIdentifier} />
            <Item label="Masked identifier" value={record.account?.maskedIdentifier} />
            <Item label="Account label" value={record.account?.displayLabel || '—'} />
            <Item label="Created" value={formatDateTime(record.createdAt)} />
            <Item label="Last UI update" value={formatDateTime(record.updatedAt)} />
          </dl>
          <p className="text-sm leading-6">{record.description}</p>
          {record.referenceNote ? <p className="text-sm text-muted">Note: {record.referenceNote}</p> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Party title="Sender" party={record.sender} />
            <Party title="Receiver" party={record.receiver} />
          </div>
          {record.account?.bankName ? (
            <div className="rounded-control bg-soft p-4 text-sm leading-6">
              <p className="font-medium">{record.account.bankName}</p>
              <p>{record.account.holderName}</p>
              <p>{record.account.bankAddress}</p>
              <p>{record.account.routingLabel}: {record.account.routingCode} · format check only</p>
            </div>
          ) : null}
          {record.account?.walletProvider ? (
            <p className="text-sm text-muted">{record.account.walletProvider} · {record.account.networkLabel || 'No network label'}</p>
          ) : null}
        </section>
        <div className="space-y-4">
          <section className="card p-5">
            <h2 className="text-base font-semibold">Activity timeline</h2>
            <p className="mb-4 mt-1 text-sm text-muted">Every event is simulated.</p>
            <TransactionTimeline events={record.timeline} />
          </section>
          <section className="card space-y-3 p-5">
            <h2 className="text-base font-semibold">Demo reference code</h2>
            <p className="text-sm leading-6 text-muted">A code shown here is a non-authoritative demo reference. It is not a banking approval, and this screen cannot reset or override one.</p>
            {record.approvalDemo ? (
              <div className="rounded-control bg-soft p-3">
                <p className="font-mono text-sm font-medium">{record.approvalDemo.code}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{record.approvalDemo.notice}</p>
              </div>
            ) : <p className="text-sm text-muted">No demo reference has been generated.</p>}
            {brand.appId === 'loading' && !record.approvalDemo ? (
              <Button loading={busy} variant="outline" onClick={generateCode}>Generate demo reference</Button>
            ) : null}
          </section>
          {canCancel ? <Button variant="danger" onClick={() => setCancelOpen(true)}>Cancel demo record</Button> : null}
          {brand.appId !== 'history' ? (
            <p className="text-sm leading-6 text-muted">
              Cancellation lives in the <a className="font-medium text-brand hover:underline" href={`${panelOrigin('history')}/transactions/${record.reference}`}>Transaction History panel</a>.
            </p>
          ) : null}
        </div>
      </div>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Receipt preview</h2>
          <Link className="text-sm font-medium text-brand hover:underline" to={`/transactions/${record.reference}/receipt`}>Open full preview</Link>
        </div>
        {record.receiptPreviewAt ? (
          <ReceiptTemplate record={record} embed displayName={prefs.displayName} />
        ) : (
          <div className="card p-5 text-sm leading-6 text-muted">A receipt preview has not been generated for this demo record. You can still open the preview page.</div>
        )}
      </section>
      <CancelTransactionDialog record={record} open={cancelOpen} busy={busy} onConfirm={cancelRecord} onClose={() => setCancelOpen(false)} />
    </div>
  );
}

function Item({ label, value }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium">{value || '—'}</dd>
    </div>
  );
}

function Party({ title, party }) {
  return (
    <div className="rounded-control border border-line p-4">
      <p className="eyebrow">{title} · sample data</p>
      <p className="mt-2 font-medium">{party?.displayName}</p>
      <p className="text-sm text-muted">{ACCOUNT_LABEL[party?.accountType] || party?.accountType}</p>
      <p className="text-sm text-muted">{party?.institution}</p>
      {party?.address ? <p className="text-sm text-muted">{party.address}</p> : null}
    </div>
  );
}
