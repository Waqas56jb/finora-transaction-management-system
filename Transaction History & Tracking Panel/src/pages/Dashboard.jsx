import { Ban, CheckCircle2, Clock3, Layers, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ButtonLink } from '../components/Button';
import { DataTable } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { PageSkeleton } from '../components/LoadingSkeleton';
import { SectionCard, StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { useNow } from '../hooks/useNow';
import { usePreferences } from '../hooks/usePreferences';
import { useSnapshot } from '../hooks/useSnapshot';
import { CHART_COLORS } from '../utils/constants';
import { dayKey, formatClock, formatDateTime, formatMoney, last7Days } from '../utils/format';

export function Dashboard() {
  const { data, error, loading, reload } = useSnapshot();
  const { prefs } = usePreferences();
  const now = useNow();
  if (loading && !data) return <PageSkeleton />;
  if (!data) {
    return <EmptyState title="Demo records could not be loaded" description={error?.message} action={<button type="button" className="btn btn-primary" onClick={() => reload()}>Try again</button>} />;
  }
  const rows = data.transactions;
  const count = (status) => rows.filter((item) => item.status === status).length;
  const recent = rows.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5);
  const series = last7Days().map((day) => ({
    label: day.label,
    count: rows.filter((item) => dayKey(item.createdAt) === day.key).length,
  }));
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tracking"
        title="Transaction history"
        description="Search and review demo records stored on this machine. This is not a search of bank, card-network, or blockchain records."
        meta={formatClock(now)}
        actions={<ButtonLink to="/history" variant="outline">Open full history</ButtonLink>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total demo records" value={rows.length} hint="Local dataset" icon={<Layers className="h-4 w-4" />} />
        <StatCard label="Completed demo workflows" value={count('completed')} hint="Finished locally" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Pending records" value={count('pending')} hint="Still demo-only" icon={<Clock3 className="h-4 w-4" />} />
        <StatCard label="Failed records" value={count('failed')} hint="Mock workflow stopped" icon={<XCircle className="h-4 w-4" />} />
        <StatCard label="Cancelled demo records" value={count('cancelled')} hint="Cancelled locally" icon={<Ban className="h-4 w-4" />} />
      </div>
      <SectionCard title="Recent activity" description="Demo records created over the last seven days.">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <CartesianGrid stroke={prefs.theme === 'dark' ? CHART_COLORS.gridDark : CHART_COLORS.grid} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} width={28} tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="count" name="Demo records" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
      <DataTable
        caption="Recent demo records"
        rowKey="id"
        rows={recent}
        emptyTitle="No demo records yet"
        emptyDescription="Records created in the Loading Panel appear here after you refresh this page."
        emptyAction={<a className="btn btn-primary" href="http://localhost:5174/new">Open the Loading Panel</a>}
        columns={[
          { key: 'reference', label: 'Reference', render: (row) => row.reference },
          { key: 'transactionType', label: 'Type', render: (row) => <span className="capitalize">{row.transactionType}</span> },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'amount', label: 'Amount', align: 'right', render: (row) => formatMoney(row.amount, row.currency) },
          { key: 'createdAt', label: 'Created', render: (row) => formatDateTime(row.createdAt) },
          { key: 'actions', label: 'Action', align: 'right', render: (row) => <Link className="font-medium text-brand hover:underline" to={`/transactions/${row.reference}`}>View</Link> },
        ]}
        mobileRender={(row) => (
          <div className="space-y-2">
            <div className="flex justify-between gap-2"><span className="font-medium">{row.reference}</span><StatusBadge status={row.status} /></div>
            <p className="text-sm text-muted">{formatMoney(row.amount, row.currency)} · {formatDateTime(row.createdAt)}</p>
            <Link className="text-sm font-medium text-brand" to={`/transactions/${row.reference}`}>View</Link>
          </div>
        )}
      />
    </div>
  );
}
