import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { Callout } from '../components/DemoBanner';
import { CancelTransactionDialog } from '../components/CancelTransactionDialog';
import { Drawer } from '../components/Drawer';
import { EmptyState } from '../components/EmptyState';
import { ExportButton } from '../components/ExportButton';
import { PageHeader } from '../components/PageHeader';
import { TransactionDetailsDrawer } from '../components/TransactionDetailsDrawer';
import { TransactionFilters } from '../components/TransactionFilters';
import { TransactionSearch } from '../components/TransactionSearch';
import { TransactionTable } from '../components/TransactionTable';
import { useToast } from '../components/ToastProvider';
import { usePreferences } from '../hooks/usePreferences';
import { useSnapshot } from '../hooks/useSnapshot';
import { panelOrigin } from '../config/brand';
import { cancelDemoTransaction, searchTransactions } from '../services/api';
import { downloadText, toCsv, TRANSACTION_CSV_COLUMNS } from '../utils/csv';

const INITIAL = {
  query: '',
  status: '',
  transactionType: '',
  protocolFamily: '',
  protocolIdentifier: '',
  currency: '',
  accountType: '',
  dateFrom: '',
  dateTo: '',
  sort: 'createdAt',
  dir: 'desc',
  page: 1,
};

export function TransactionHistory() {
  const { data } = useSnapshot();
  const { prefs } = usePreferences();
  const toast = useToast();
  const [filters, setFilters] = useState(INITIAL);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quick, setQuick] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let live = true;
    setLoading(true);
    searchTransactions({ ...filters, pageSize: prefs.pageSize })
      .then((payload) => { if (live) { setResult(payload); setFailed(false); } })
      .catch(() => { if (live) { setFailed(true); setResult(null); } })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [filters, prefs.pageSize, data]);

  function patch(partial) {
    setFilters((current) => ({ ...current, page: 1, ...partial }));
  }

  const active = useMemo(() => {
    const labels = [];
    if (filters.query) labels.push(`Search: ${filters.query}`);
    if (filters.status) labels.push(filters.status);
    if (filters.transactionType) labels.push(filters.transactionType);
    if (filters.protocolFamily) labels.push(filters.protocolFamily);
    if (filters.protocolIdentifier) labels.push(filters.protocolIdentifier);
    if (filters.currency) labels.push(filters.currency);
    if (filters.accountType) labels.push(filters.accountType);
    if (filters.dateFrom || filters.dateTo) labels.push(`${filters.dateFrom || '…'} to ${filters.dateTo || '…'}`);
    return labels;
  }, [filters]);

  async function exportRows() {
    try {
      const payload = await searchTransactions({ ...filters, unpaged: true });
      if (!payload.items.length) throw new Error('There are no filtered demo records to export.');
      downloadText('finora-demo-transactions.csv', toCsv(TRANSACTION_CSV_COLUMNS, payload.items));
    } catch (error) {
      throw error instanceof Error ? error : new Error('Export failed. Nothing was downloaded.');
    }
  }

  async function confirmCancel() {
    setCancelling(true);
    try {
      await cancelDemoTransaction(cancelTarget.id);
      toast.success('Demo record cancelled.');
      setCancelTarget(null);
      setQuick(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCancelling(false);
    }
  }

  const catalogEmpty = data && data.transactions.length === 0;
  const noMatch = !catalogEmpty && result && result.total === 0;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Tracking"
        title="Search demo records"
        description="Matches reference, account label, masked identifier, and protocol identifier in the local demo dataset."
        actions={<ExportButton onExport={exportRows} disabled={loading || !result?.total} />}
      />
      <Callout tone="info">This search does not query a bank, SWIFT, a card network, or a blockchain.</Callout>
      <TransactionSearch value={filters.query} onChange={(query) => patch({ query })} onClear={() => patch({ query: '' })} />
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p className="text-muted">{result ? `${result.total} matching demo record${result.total === 1 ? '' : 's'}` : 'Searching demo records'}</p>
        <Button variant="outline" className="lg:hidden" onClick={() => setFiltersOpen(true)}>Filters{active.length ? ` (${active.length})` : ''}</Button>
      </div>
      {active.length ? (
        <div className="flex flex-wrap gap-2">
          {active.map((label) => <span key={label} className="badge badge-neutral">{label}</span>)}
          <button type="button" className="text-sm font-medium text-brand" onClick={() => setFilters(INITIAL)}>Clear all</button>
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="card hidden h-fit p-4 lg:block">
          <h2 className="mb-3 text-sm font-semibold">Filters</h2>
          <TransactionFilters
            filters={filters}
            patch={patch}
            protocols={data?.protocols || []}
            currencies={data?.currencies || []}
            onClear={() => setFilters(INITIAL)}
          />
        </aside>
        <div>
          {failed ? (
            <EmptyState title="Demo records could not be loaded" description="The local demo store did not return a result." action={<Button onClick={() => setFilters((current) => ({ ...current }))}>Try again</Button>} />
          ) : (
            <TransactionTable
              rows={result?.items || []}
              loading={loading}
              sort={{ key: filters.sort, dir: filters.dir }}
              onSort={(key) => setFilters((current) => ({ ...current, sort: key, dir: current.sort === key && current.dir === 'asc' ? 'desc' : 'asc', page: 1 }))}
              page={result?.page || 1}
              pages={result?.pages || 1}
              total={result?.total || 0}
              pageSize={prefs.pageSize}
              onPage={(page) => setFilters((current) => ({ ...current, page }))}
              emptyTitle={catalogEmpty ? 'No demo records yet' : 'No filters match'}
              emptyDescription={catalogEmpty ? 'Create a simulated request in the Loading Panel. It will show up in this shared demo dataset.' : 'Clear the search or filters to see the rest of the demo records.'}
              emptyAction={noMatch ? <Button variant="outline" onClick={() => setFilters(INITIAL)}>Clear search and filters</Button> : <a className="btn btn-primary" href={`${panelOrigin('loading')}/new`}>Create a demo request</a>}
              onQuickView={setQuick}
              onCancel={setCancelTarget}
            />
          )}
        </div>
      </div>
      <Drawer open={filtersOpen} title="Filters" onClose={() => setFiltersOpen(false)}>
        <TransactionFilters
          filters={filters}
          patch={patch}
          protocols={data?.protocols || []}
          currencies={data?.currencies || []}
          idPrefix="drawer"
          onClear={() => { setFilters(INITIAL); setFiltersOpen(false); }}
        />
        <Button className="mt-4" onClick={() => setFiltersOpen(false)}>Show results</Button>
      </Drawer>
      <TransactionDetailsDrawer record={quick} onClose={() => setQuick(null)} onCancel={(row) => { setCancelTarget(row); }} />
      <CancelTransactionDialog record={cancelTarget} open={Boolean(cancelTarget)} busy={cancelling} onConfirm={confirmCancel} onClose={() => setCancelTarget(null)} />
    </div>
  );
}
