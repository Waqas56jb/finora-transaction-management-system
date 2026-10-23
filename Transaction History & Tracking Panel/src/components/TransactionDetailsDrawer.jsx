import { Link } from 'react-router-dom';
import { Drawer } from './Drawer';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';
import { formatDateTime, formatMoney } from '../utils/format';

export function TransactionDetailsDrawer({ record, onClose, onCancel }) {
  return (
    <Drawer open={Boolean(record)} title={record?.reference || 'Demo record'} onClose={onClose}>
      {record ? (
        <div className="space-y-4 text-sm">
          <StatusBadge status={record.status} />
          <p className="text-2xl font-semibold tabular-nums">{formatMoney(record.amount, record.currency)}</p>
          <p className="leading-6 text-muted">{record.description}</p>
          <dl className="space-y-2">
            <Row label="Type" value={record.transactionType} />
            <Row label="Server" value={record.serverProfileName} />
            <Row label="Protocol" value={`${record.protocolIdentifier} · ${record.protocolFamily}`} />
            <Row label="Account" value={record.account?.maskedIdentifier} />
            <Row label="Created" value={formatDateTime(record.createdAt)} />
          </dl>
          <div className="flex flex-wrap gap-2">
            <Link className="btn btn-primary" to={`/transactions/${record.reference}`}>Open full details</Link>
            {['pending', 'completed'].includes(record.status) ? <Button variant="danger" onClick={() => onCancel(record)}>Cancel demo record</Button> : null}
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium capitalize">{value}</dd>
    </div>
  );
}
