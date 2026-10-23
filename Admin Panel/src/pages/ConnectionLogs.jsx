import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { DataTable } from '../components/DataTable';
import { Drawer } from '../components/Drawer';
import { ExportButton } from '../components/ExportButton';
import { fieldProps, FormField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../components/ToastProvider';
import { usePreferences } from '../hooks/usePreferences';
import { useSnapshot } from '../hooks/useSnapshot';
import { getConnectionLogs } from '../services/api';
import { FAMILIES } from '../utils/constants';
import { downloadText, LOG_CSV_COLUMNS, toCsv } from '../utils/csv';
import { formatDateTime } from '../utils/format';

const RESULTS = [
  ['', 'Any result'],
  ['success', 'Mock success'],
  ['error', 'Error'],
  ['timeout', 'Timeout'],
  ['validation', 'Validation'],
  ['info', 'Info'],
];

export function ConnectionLogs() {
  const { data } = useSnapshot();
  const { prefs } = usePreferences();
  const toast = useToast();
  const [filters, setFilters] = useState({
    query: '',
    serverProfileId: '',
    protocolFamily: '',
    result: '',
    dateFrom: '',
    dateTo: '',
    sort: 'timestamp',
    dir: 'desc',
    page: 1,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let live = true;
    setLoading(true);
    getConnectionLogs({ ...filters, pageSize: prefs.pageSize })
      .then((payload) => { if (live) setResult(payload); })
      .catch(() => { if (live) setResult({ items: [], total: 0, page: 1, pages: 1 }); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [filters, prefs.pageSize, data]);

  function patch(partial) {
    setFilters((current) => ({ ...current, page: 1, ...partial }));
  }

  function onSort(key) {
    setFilters((current) => ({
      ...current,
      sort: key,
      dir: current.sort === key && current.dir === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  }

  async function copyRef(value) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Reference ID copied.');
    } catch {
      toast.error('The reference could not be copied.');
    }
  }

  async function exportLogs() {
    const payload = await getConnectionLogs({ ...filters, unpaged: true, pageSize: prefs.pageSize });
    if (!payload.items.length) throw new Error('There are no filtered demo logs to export.');
    downloadText('finora-demo-connection-logs.csv', toCsv(LOG_CSV_COLUMNS, payload.items));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Monitor"
        title="Connection logs"
        description="Simulated log entries from local demo operations. These are not records from SWIFT, card networks, or a bank."
        actions={<ExportButton onExport={exportLogs} />}
      />
      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between md:hidden">
          <p className="text-sm font-medium">Filters</p>
          <Button variant="outline" onClick={() => setShowFilters((value) => !value)}>{showFilters ? 'Hide filters' : 'Show filters'}</Button>
        </div>
        <div className={`grid gap-3 md:grid-cols-2 xl:grid-cols-3 ${showFilters ? '' : 'max-md:hidden'}`}>
          <FormField label="Search" htmlFor="log-search">
            <input {...fieldProps('log-search')} value={filters.query} onChange={(event) => patch({ query: event.target.value })} placeholder="Operation, reference, or message" />
          </FormField>
          <FormField label="Server" htmlFor="log-server">
            <select {...fieldProps('log-server')} value={filters.serverProfileId} onChange={(event) => patch({ serverProfileId: event.target.value })}>
              <option value="">All servers</option>
              {(data?.serverProfiles || []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </FormField>
          <FormField label="Protocol family" htmlFor="log-family">
            <select {...fieldProps('log-family')} value={filters.protocolFamily} onChange={(event) => patch({ protocolFamily: event.target.value })}>
              <option value="">All families</option>
              {FAMILIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </FormField>
          <FormField label="Status" htmlFor="log-status">
            <select {...fieldProps('log-status')} value={filters.result} onChange={(event) => patch({ result: event.target.value })}>
              {RESULTS.map(([value, label]) => <option key={label} value={value}>{label}</option>)}
            </select>
          </FormField>
          <FormField label="From" htmlFor="log-from">
            <input {...fieldProps('log-from')} type="date" value={filters.dateFrom} onChange={(event) => patch({ dateFrom: event.target.value })} />
          </FormField>
          <FormField label="To" htmlFor="log-to">
            <input {...fieldProps('log-to')} type="date" value={filters.dateTo} onChange={(event) => patch({ dateTo: event.target.value })} />
          </FormField>
        </div>
        <div className="mt-3">
          <Button variant="ghost" onClick={() => setFilters({ query: '', serverProfileId: '', protocolFamily: '', result: '', dateFrom: '', dateTo: '', sort: 'timestamp', dir: 'desc', page: 1 })}>Clear filters</Button>
        </div>
      </div>
      <DataTable
        caption="Simulated connection logs"
        rowKey="id"
        rows={result?.items || []}
        loading={loading}
        sort={{ key: filters.sort, dir: filters.dir }}
        onSort={onSort}
        page={result?.page || 1}
        pages={result?.pages || 1}
        total={result?.total || 0}
        pageSize={prefs.pageSize}
        onPage={(page) => setFilters((current) => ({ ...current, page }))}
        emptyTitle="No log entries match"
        emptyDescription="Try a different server, status, or date range."
        columns={[
          { key: 'timestamp', label: 'Timestamp', sortable: true, render: (row) => formatDateTime(row.timestamp) },
          { key: 'serverName', label: 'Server profile', sortable: true },
          { key: 'protocolFamily', label: 'Family', sortable: true },
          { key: 'operation', label: 'Operation', sortable: true },
          { key: 'result', label: 'Result', sortable: true, render: (row) => <StatusBadge kind="log" status={row.result} /> },
          { key: 'durationMs', label: 'Duration', sortable: true, align: 'right', render: (row) => <span className="tabular-nums">{row.durationMs} ms</span> },
          { key: 'referenceId', label: 'Reference', sortable: true },
          { key: 'actions', label: 'Action', align: 'right', render: (row) => <button type="button" className="text-sm font-medium text-brand hover:underline" onClick={() => setSelected(row)}>View details</button> },
        ]}
        mobileRender={(row) => (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{row.operation}</p>
              <StatusBadge kind="log" status={row.result} />
            </div>
            <p className="text-sm text-muted">{row.serverName} · {formatDateTime(row.timestamp)}</p>
            <button type="button" className="text-sm font-medium text-brand" onClick={() => setSelected(row)}>View details</button>
          </div>
        )}
      />
      <Drawer open={Boolean(selected)} title="Log details" onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-4 text-sm">
            <StatusBadge kind="log" status={selected.result} />
            <p className="leading-6 text-muted">This entry was generated by the local demo store. It is not evidence of an external connection.</p>
            <dl className="space-y-3">
              {[
                ['Timestamp', formatDateTime(selected.timestamp)],
                ['Server profile', selected.serverName],
                ['Protocol family', selected.protocolFamily],
                ['Operation', selected.operation],
                ['Duration', `${selected.durationMs} ms`],
                ['Reference ID', selected.referenceId],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-muted">{label}</dt>
                  <dd className="mt-0.5 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            {selected.errorMessage ? <p className="rounded-control bg-soft p-3 leading-6">{selected.errorMessage}</p> : <p className="text-muted">No error message on this entry.</p>}
            <Button variant="outline" onClick={() => copyRef(selected.referenceId)}>Copy reference ID</Button>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
