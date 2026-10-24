import { Activity, AlertTriangle, CheckCircle2, Clock3, Server, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DataTable } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { PageSkeleton } from '../components/LoadingSkeleton';
import { SectionCard, StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { ButtonLink } from '../components/Button';
import { useNow } from '../hooks/useNow';
import { usePreferences } from '../hooks/usePreferences';
import { useSnapshot } from '../hooks/useSnapshot';
import { CHART_COLORS, FAMILY_LABEL } from '../utils/constants';
import { dayKey, formatClock, formatDateTime, formatMoney, last7Days } from '../utils/format';

export function Dashboard() {
  const { data, error, loading, reload } = useSnapshot();
  const { prefs } = usePreferences();
  const now = useNow();

  if (loading && !data) return <PageSkeleton />;
  if (!data) {
    return (
      <EmptyState
        title="Demo data could not be loaded"
        description={error?.message || 'The local demo store did not respond.'}
        action={<button type="button" className="btn btn-primary" onClick={() => reload()}>Try again</button>}
      />
    );
  }

  const transactions = data.transactions;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentErrors = data.connectionLogs.filter((log) => log.result === 'error' && new Date(log.timestamp).getTime() >= weekAgo).length;
  const counts = {
    total: transactions.length,
    completed: transactions.filter((item) => item.status === 'completed').length,
    pending: transactions.filter((item) => item.status === 'pending').length,
    failed: transactions.filter((item) => item.status === 'failed').length,
  };
  const days = last7Days();
  const series = days.map((day) => ({
    label: day.label,
    count: transactions.filter((item) => dayKey(item.createdAt) === day.key).length,
  }));
  const statusData = [
    { name: 'Completed (Demo)', value: counts.completed, color: CHART_COLORS.green },
    { name: 'Pending (Demo)', value: counts.pending, color: CHART_COLORS.amber },
    { name: 'Failed (Demo)', value: counts.failed, color: CHART_COLORS.red },
    { name: 'Cancelled (Demo)', value: transactions.filter((item) => item.status === 'cancelled').length, color: CHART_COLORS.slate },
  ].filter((item) => item.value > 0);
  const recent = transactions.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 6);
  const grid = prefs.theme === 'dark' ? CHART_COLORS.gridDark : CHART_COLORS.grid;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Admin dashboard"
        description="A local view of demo transaction records, server profiles, and simulated connection results."
        meta={formatClock(now)}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total transactions" value={counts.total} hint="Demo records in the local dataset" icon={<Activity className="h-4 w-4" />} />
        <StatCard label="Successful demo transactions" value={counts.completed} hint="Workflow completed locally" icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Pending demo transactions" value={counts.pending} hint="Stored locally, still pending" icon={<Clock3 className="h-4 w-4" />} />
        <StatCard label="Failed demo transactions" value={counts.failed} hint="Mock workflow did not finish" icon={<XCircle className="h-4 w-4" />} />
        <StatCard label="Configured server profiles" value={data.serverProfiles.length} hint="Local configuration only" icon={<Server className="h-4 w-4" />} />
        <StatCard label="Recent connection errors" value={recentErrors} hint="Simulated error results, last 7 days" icon={<AlertTriangle className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <SectionCard className="lg:col-span-3" title="Transaction activity" description="Demo records created on each of the last seven days.">
          <div className="h-52 min-w-0 w-full sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <CartesianGrid stroke={grid} vertical={false} />
                <XAxis dataKey="label" interval="preserveStartEnd" tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} width={28} tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" name="Demo records" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.16} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard className="lg:col-span-2" title="Status mix" description="Counts from the local demo dataset.">
          {statusData.length === 0 ? (
            <p className="text-sm text-muted">No demo records yet.</p>
          ) : (
            <div className="grid items-center gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <div className="h-44 min-w-0 w-full sm:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={2}>
                      {statusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2 text-sm">
                {statusData.map((entry) => (
                  <li key={entry.name} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} aria-hidden="true" />
                      {entry.name}
                    </span>
                    <span className="tabular-nums font-medium">{entry.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SectionCard>
      </div>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Recent transactions</h2>
            <p className="text-sm text-muted">Latest demo records. Status names describe the local workflow only.</p>
          </div>
        </div>
        <DataTable
          caption="Recent demo transactions"
          rowKey="id"
          rows={recent}
          emptyTitle="No demo transactions yet"
          emptyDescription="Create one from the Loading Panel when you are ready to test the form."
          columns={[
            { key: 'reference', label: 'Reference', render: (row) => <span className="font-medium">{row.reference}</span> },
            { key: 'transactionType', label: 'Type', render: (row) => <span className="capitalize">{row.transactionType}</span> },
            { key: 'protocolIdentifier', label: 'Protocol' },
            { key: 'currency', label: 'Currency' },
            { key: 'amount', label: 'Amount', align: 'right', className: 'tabular-nums', render: (row) => formatMoney(row.amount, row.currency) },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            { key: 'createdAt', label: 'Created', render: (row) => formatDateTime(row.createdAt) },
            { key: 'actions', label: 'Action', align: 'right', render: (row) => <Link className="text-sm font-medium text-brand hover:underline" to={`/transactions/${row.reference}`}>View details</Link> },
          ]}
          mobileRender={(row) => (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{row.reference}</p>
                <StatusBadge status={row.status} />
              </div>
              <p className="text-sm text-muted">{row.transactionType} · {row.protocolIdentifier} · {formatMoney(row.amount, row.currency)}</p>
              <Link className="text-sm font-medium text-brand" to={`/transactions/${row.reference}`}>View details</Link>
            </div>
          )}
        />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Server connection overview</h2>
          <p className="text-sm text-muted">These profiles are local configuration. A Connected (Demo) badge is not a live financial network session.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {data.serverProfiles.map((profile) => (
            <article key={profile.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{profile.name}</h3>
                  <p className="mt-1 text-sm text-muted">{FAMILY_LABEL[profile.protocolFamily]} · {profile.environment}</p>
                </div>
                <StatusBadge kind="server" status={profile.status} />
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex flex-wrap justify-between gap-x-3 gap-y-1"><dt className="text-muted">Endpoint</dt><dd className="min-w-0 break-all text-right">{profile.baseUrl}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted">Default currency</dt><dd>{profile.defaultCurrency}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted">Profile</dt><dd>{profile.enabled ? 'Enabled' : 'Disabled'}</dd></div>
              </dl>
              <div className="mt-4">
                <ButtonLink to="/servers" variant="outline">Manage profiles</ButtonLink>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
