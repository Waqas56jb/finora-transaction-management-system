import { useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Power, Trash2, Wifi } from 'lucide-react';
import { Button } from '../components/Button';
import { Callout } from '../components/DemoBanner';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DataTable } from '../components/DataTable';
import { Drawer } from '../components/Drawer';
import { EmptyState } from '../components/EmptyState';
import { fieldProps, FormField } from '../components/FormField';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { PageSkeleton } from '../components/LoadingSkeleton';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../components/ToastProvider';
import { useSnapshot } from '../hooks/useSnapshot';
import { createServerProfile, deleteServerProfile, testDemoConnection, updateServerProfile } from '../services/api';
import { ENVIRONMENTS, FAMILY_LABEL, SERVER_STATUSES, SERVER_TYPES } from '../utils/constants';
import { formatDateTime } from '../utils/format';

const EMPTY = {
  name: '',
  type: 'online',
  environment: 'Demo',
  baseUrl: 'https://demo.finora.local/',
  protocolFamily: 'online',
  defaultCurrency: 'USD',
  timeoutMs: 8000,
  status: 'disconnected',
  enabled: true,
  notes: '',
};

export function ServerConfiguration() {
  const { data, loading, error, reload } = useSnapshot();
  const toast = useToast();
  const [drawer, setDrawer] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testingId, setTestingId] = useState('');

  const currencies = data?.currencies || [];

  const openCreate = () => {
    setForm(EMPTY);
    setErrors({});
    setDrawer({ mode: 'create' });
  };

  const openEdit = (profile) => {
    setForm({ ...profile, timeoutMs: profile.timeoutMs });
    setErrors({});
    setDrawer({ mode: 'edit', id: profile.id });
  };

  const openView = (profile) => setDrawer({ mode: 'view', profile });

  function updateField(key, value) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === 'type') next.protocolFamily = value;
      return next;
    });
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const payload = { ...form, timeoutMs: Number(form.timeoutMs), enabled: Boolean(form.enabled) };
      if (drawer.mode === 'create') await createServerProfile(payload);
      else await updateServerProfile(drawer.id, payload);
      toast.success(drawer.mode === 'create' ? 'Demo server profile created.' : 'Demo server profile updated.');
      setDrawer(null);
    } catch (err) {
      setErrors(err.fields || {});
      toast.error(err.message || 'The profile could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleEnabled(profile) {
    try {
      await updateServerProfile(profile.id, { enabled: !profile.enabled });
      toast.success(profile.enabled ? 'Demo profile disabled.' : 'Demo profile enabled.');
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function confirmDelete() {
    setRemoving(true);
    try {
      await deleteServerProfile(removeTarget.id);
      toast.success('Demo profile deleted from local configuration.');
      setRemoveTarget(null);
      setDrawer(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRemoving(false);
    }
  }

  async function runTest(profile) {
    setTestingId(profile.id);
    try {
      const result = await Promise.all([
        testDemoConnection(profile.id),
        new Promise((resolve) => { window.setTimeout(resolve, 700); }),
      ]).then(([value]) => value);
      setTestResult({ ...result, name: profile.name });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTestingId('');
    }
  }

  async function copyRef(value) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Reference ID copied.');
    } catch {
      toast.error('The reference could not be copied.');
    }
  }

  const rows = useMemo(() => data?.serverProfiles || [], [data]);

  if (loading && !data) return <PageSkeleton />;
  if (!data) {
    return <EmptyState title="Profiles could not be loaded" description={error?.message} action={<Button onClick={() => reload()}>Try again</Button>} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuration"
        title="Server configuration"
        description="Manage local demo server profiles. These categories do not provision banking infrastructure."
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add server profile</Button>}
      />
      <Callout tone="warning" title="Secrets stay out of the browser">
        Production credentials, certificates, and provider keys are not collected here. Masked placeholders are examples only. A future backend must store secrets.
      </Callout>
      <DataTable
        caption="Demo server profiles"
        rowKey="id"
        rows={rows}
        emptyTitle="No server profiles"
        emptyDescription="Add a local demo profile to use it in the loading form."
        columns={[
          { key: 'name', label: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
          { key: 'type', label: 'Type', render: (row) => SERVER_TYPES.find((item) => item.id === row.type)?.label || row.type },
          { key: 'environment', label: 'Environment' },
          { key: 'protocolFamily', label: 'Family', render: (row) => FAMILY_LABEL[row.protocolFamily] },
          { key: 'defaultCurrency', label: 'Currency' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge kind="server" status={row.status} /> },
          {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (row) => (
              <div className="flex justify-end gap-1">
                <IconButton label="View details" onClick={() => openView(row)}><Eye className="h-4 w-4" /></IconButton>
                <IconButton label="Edit configuration" onClick={() => openEdit(row)}><Pencil className="h-4 w-4" /></IconButton>
                <IconButton label="Test demo connection" onClick={() => runTest(row)} disabled={testingId === row.id}><Wifi className="h-4 w-4" /></IconButton>
                <IconButton label={row.enabled ? 'Disable profile' : 'Enable profile'} onClick={() => toggleEnabled(row)}><Power className="h-4 w-4" /></IconButton>
                <IconButton label="Delete profile" onClick={() => setRemoveTarget(row)}><Trash2 className="h-4 w-4" /></IconButton>
              </div>
            ),
          },
        ]}
        mobileRender={(row) => (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{row.name}</p>
                <p className="text-sm text-muted">{row.environment} · {row.enabled ? 'Enabled' : 'Disabled'}</p>
              </div>
              <StatusBadge kind="server" status={row.status} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => openView(row)}>View details</Button>
              <Button variant="outline" onClick={() => openEdit(row)}>Edit</Button>
              <Button variant="outline" loading={testingId === row.id} onClick={() => runTest(row)}>Test demo connection</Button>
              <Button variant="ghost" onClick={() => toggleEnabled(row)}>{row.enabled ? 'Disable' : 'Enable'}</Button>
              <Button variant="danger" onClick={() => setRemoveTarget(row)}>Delete</Button>
            </div>
          </div>
        )}
      />

      <Drawer
        open={drawer?.mode === 'view'}
        title={drawer?.profile?.name || 'Profile'}
        onClose={() => setDrawer(null)}
      >
        {drawer?.profile ? <ProfileDetails profile={drawer.profile} onEdit={() => openEdit(drawer.profile)} onTest={() => runTest(drawer.profile)} onToggle={() => toggleEnabled(drawer.profile)} onDelete={() => setRemoveTarget(drawer.profile)} testing={testingId === drawer.profile.id} /> : null}
      </Drawer>

      <Drawer open={drawer?.mode === 'create' || drawer?.mode === 'edit'} title={drawer?.mode === 'edit' ? 'Edit configuration' : 'Add server profile'} onClose={() => setDrawer(null)}>
        <form className="space-y-4" onSubmit={save}>
          <FormField label="Server display name" htmlFor="server-name" required error={errors.name}>
            <input {...fieldProps('server-name', errors.name)} value={form.name} onChange={(event) => updateField('name', event.target.value)} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Server type" htmlFor="server-type" required error={errors.type}>
              <select {...fieldProps('server-type', errors.type)} value={form.type} onChange={(event) => updateField('type', event.target.value)}>
                {SERVER_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </FormField>
            <FormField label="Environment label" htmlFor="server-env" required error={errors.environment}>
              <select {...fieldProps('server-env', errors.environment)} value={form.environment} onChange={(event) => updateField('environment', event.target.value)}>
                {ENVIRONMENTS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Base endpoint URL" htmlFor="server-url" required error={errors.baseUrl} hint="Stored for display. Test Demo Connection never calls this address.">
            <input {...fieldProps('server-url', errors.baseUrl, true)} value={form.baseUrl} onChange={(event) => updateField('baseUrl', event.target.value)} placeholder="https://demo.finora.local/online" inputMode="url" autoComplete="off" />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Protocol family" htmlFor="server-family" required error={errors.protocolFamily}>
              <select {...fieldProps('server-family', errors.protocolFamily)} value={form.protocolFamily} onChange={(event) => updateField('protocolFamily', event.target.value)}>
                {Object.entries(FAMILY_LABEL).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
            </FormField>
            <FormField label="Default currency" htmlFor="server-currency" required error={errors.defaultCurrency}>
              <select {...fieldProps('server-currency', errors.defaultCurrency)} value={form.defaultCurrency} onChange={(event) => updateField('defaultCurrency', event.target.value)}>
                {currencies.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.name}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Connection timeout (ms)" htmlFor="server-timeout" required error={errors.timeoutMs}>
              <input {...fieldProps('server-timeout', errors.timeoutMs)} type="number" min="1000" max="120000" step="1000" value={form.timeoutMs} onChange={(event) => updateField('timeoutMs', event.target.value)} />
            </FormField>
            <FormField label="Status" htmlFor="server-status" required error={errors.status} hint="Connected (Demo) means a simulated label, not a live session.">
              <select {...fieldProps('server-status', errors.status, true)} value={form.status} onChange={(event) => updateField('status', event.target.value)}>
                {SERVER_STATUSES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="API secret" htmlFor="server-secret" hint="Example only. This value is not collected or stored.">
            <input id="server-secret" className="field" value="••••••••" disabled readOnly aria-disabled="true" />
          </FormField>
          <FormField label="Notes" htmlFor="server-notes" error={errors.notes}>
            <textarea {...fieldProps('server-notes', errors.notes)} rows={3} value={form.notes} onChange={(event) => updateField('notes', event.target.value)} />
          </FormField>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.enabled} onChange={(event) => updateField('enabled', event.target.checked)} />
            Profile enabled for demo forms
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDrawer(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>{drawer?.mode === 'edit' ? 'Save changes' : 'Create profile'}</Button>
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        open={Boolean(removeTarget)}
        title="Delete demo profile?"
        tone="danger"
        confirmLabel="Delete profile"
        busy={removing}
        onConfirm={confirmDelete}
        onClose={() => setRemoveTarget(null)}
        body={`Delete “${removeTarget?.name || ''}”? This removes local configuration only. Existing demo records keep the profile name that was stored with them.`}
      />

      <Modal open={Boolean(testResult)} title={testResult?.title || 'Demo connection'} onClose={() => setTestResult(null)}>
        {testResult ? (
          <div className="space-y-3 text-sm leading-6">
            <StatusBadge kind="log" status={testResult.result} />
            <p>{testResult.message}</p>
            <p><span className="text-muted">Profile:</span> {testResult.name}</p>
            <p><span className="text-muted">URL not contacted:</span> {testResult.url}</p>
            <p><span className="text-muted">Simulated duration:</span> {testResult.durationMs} ms</p>
            <p><span className="text-muted">Reference:</span> {testResult.referenceId}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => copyRef(testResult.referenceId)}>Copy reference ID</Button>
              <Button onClick={() => setTestResult(null)}>Close</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function IconButton({ label, children, ...props }) {
  return (
    <button type="button" className="rounded-lg p-2 text-muted hover:bg-soft hover:text-ink" aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}

function ProfileDetails({ profile, onEdit, onTest, onToggle, onDelete, testing }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <StatusBadge kind="server" status={profile.status} />
        <span className="badge badge-neutral">{profile.environment}</span>
        <span className="badge badge-neutral">{profile.enabled ? 'Enabled' : 'Disabled'}</span>
      </div>
      <dl className="space-y-3 text-sm">
        {[
          ['Type', SERVER_TYPES.find((item) => item.id === profile.type)?.label],
          ['Protocol family', FAMILY_LABEL[profile.protocolFamily]],
          ['Base endpoint', profile.baseUrl],
          ['Default currency', profile.defaultCurrency],
          ['Timeout', `${profile.timeoutMs} ms`],
          ['Updated', formatDateTime(profile.updatedAt)],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-muted">{label}</dt>
            <dd className="mt-0.5 break-all font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm leading-6 text-muted">{profile.notes}</p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onEdit}><Pencil className="h-4 w-4" /> Edit configuration</Button>
        <Button variant="outline" loading={testing} onClick={onTest}>Test demo connection</Button>
        <Button variant="secondary" onClick={onToggle}>{profile.enabled ? 'Disable profile' : 'Enable profile'}</Button>
        <Button variant="danger" onClick={onDelete}>Delete profile</Button>
      </div>
    </div>
  );
}
