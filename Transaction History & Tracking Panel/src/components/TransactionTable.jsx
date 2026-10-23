import { Link } from 'react-router-dom';
import { DataTable } from './DataTable';
import { StatusBadge } from './StatusBadge';
import { formatDateTime, formatMoney } from '../utils/format';

export function TransactionTable({
  rows,
  loading,
  sort,
  onSort,
  page,
  pages,
  total,
  pageSize,
  onPage,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onQuickView,
  onCancel,
}) {
  return (
    <DataTable
      caption="Demo transaction history"
      rowKey="id"
      rows={rows}
      loading={loading}
      sort={sort}
      onSort={onSort}
      page={page}
      pages={pages}
      total={total}
      pageSize={pageSize}
      onPage={onPage}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      emptyAction={emptyAction}
      columns={[
        { key: 'reference', label: 'Reference', sortable: true, render: (row) => <span className="font-medium">{row.reference}</span> },
        { key: 'transactionType', label: 'Type', sortable: true, render: (row) => <span className="capitalize">{row.transactionType}</span> },
        { key: 'serverProfileName', label: 'Server profile', sortable: true },
        { key: 'protocolIdentifier', label: 'Protocol', sortable: true },
        { key: 'accountType', label: 'Account', sortable: true, render: (row) => <span className="capitalize">{row.accountType}</span> },
        { key: 'currency', label: 'Currency', sortable: true },
        { key: 'amount', label: 'Amount', sortable: true, align: 'right', render: (row) => formatMoney(row.amount, row.currency) },
        { key: 'status', label: 'Status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
        { key: 'createdAt', label: 'Created', sortable: true, render: (row) => formatDateTime(row.createdAt) },
        {
          key: 'actions',
          label: 'Actions',
          align: 'right',
          render: (row) => (
            <div className="flex justify-end gap-3">
              <button type="button" className="font-medium text-brand hover:underline" onClick={() => onQuickView(row)}>Quick view</button>
              <Link className="font-medium text-brand hover:underline" to={`/transactions/${row.reference}`}>Open</Link>
              {['pending', 'completed'].includes(row.status) ? (
                <button type="button" className="font-medium text-rose-800 hover:underline" onClick={() => onCancel(row)}>Cancel</button>
              ) : null}
            </div>
          ),
        },
      ]}
      mobileRender={(row) => (
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium">{row.reference}</p>
            <StatusBadge status={row.status} />
          </div>
          <p className="text-sm text-muted">{row.serverProfileName} · {row.protocolIdentifier}</p>
          <p className="text-sm">{formatMoney(row.amount, row.currency)} · {formatDateTime(row.createdAt)}</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <button type="button" className="font-medium text-brand" onClick={() => onQuickView(row)}>Quick view</button>
            <Link className="font-medium text-brand" to={`/transactions/${row.reference}`}>Open</Link>
            {['pending', 'completed'].includes(row.status) ? <button type="button" className="font-medium text-rose-800" onClick={() => onCancel(row)}>Cancel</button> : null}
          </div>
        </div>
      )}
    />
  );
}
