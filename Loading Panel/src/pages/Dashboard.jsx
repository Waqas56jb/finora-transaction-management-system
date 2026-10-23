import { CheckCircle2, Clock3, PlusCircle, XCircle } from 'lucide-react';
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
    return <EmptyState title="Demo requests could not be loaded" description={error?.message} action={<button type="button" className="btn btn-primary" onClick={() => reload()}>Try again</button>} />;
  }
  const rows = data.transactions;
  const recent = rows.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 6);
  const series = last7Days().map((day) => ({
    label: day.label,
    count: rows.filter((item) => dayKey(item.createdAt) === day.key).length,
  }));
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Loading"
        title="Loading dashboard"
        description="Track simulated load and unload requests. Creating a record here does not move funds."
        meta={formatClock(now)}
        actions={<ButtonLink to="/new"><PlusCircle className="h-4 w-4" /> New loading request</ButtonLink>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total demo loading requests" value={rows.length} hint="Load and unload records" icon={<PlusCircle className="h-4 w-4" />} />
        <StatCard label="Completed demo workflows" value={rows.filter((item) => item.status === 'completed').length} hint="Local workflow finished" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Pending demo workflows" value={rows.filter((item) => item.status === 'pending').length} hint="Stored, not sent anywhere" icon={<Clock3 className="h-4 w-4" />} />
        <StatCard label="Failed demo workflows" value={rows.filter((item) => item.status === 'failed').length} hint="Mock processing stopped" icon={<XCircle className="h-4 w-4" />} />
      </div>
      <SectionCard title="Requests this week" description="Demo records by the day they were created.">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <CartesianGrid stroke={prefs.theme === 'dark' ? CHART_COLORS.gridDark : CHART_COLORS.grid} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} width={28} tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="count" name="Demo requests" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
      <DataTable
        caption="Recent loading requests"
        rowKey="id"
        rows={recent}
        emptyTitle="No demo loading requests yet"
        emptyDescription="Start a simulated request when you want to exercise the form."
        emptyAction={<ButtonLink to="/new">Create a demo request</ButtonLink>}
        columns={[
          { key: 'reference', label: 'Reference', render: (row) => <span className="font-medium">{row.reference}</span> },
          { key: 'accountType', label: 'Account type', render: (row) => <span className="capitalize">{row.accountType}</span> },
          { key: 'protocolIdentifier', label: 'Protocol' },
          { key: 'currency', label: 'Currency' },
          { key: 'amount', label: 'Requested amount', align: 'right', render: (row) => formatMoney(row.amount, row.currency) },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'createdAt', label: 'Created', render: (row) => formatDateTime(row.createdAt) },
          { key: 'actions', label: 'Action', align: 'right', render: (row) => <Link className="font-medium text-brand hover:underline" to={`/transactions/${row.reference}`}>View</Link> },
        ]}
        mobileRender={(row) => (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{row.reference}</p>
              <StatusBadge status={row.status} />
            </div>
            <p className="text-sm text-muted">{row.accountType} · {row.protocolIdentifier} · {formatMoney(row.amount, row.currency)}</p>
            <Link className="text-sm font-medium text-brand" to={`/transactions/${row.reference}`}>View</Link>
          </div>
        )}
      />
    </div>
  );
}
