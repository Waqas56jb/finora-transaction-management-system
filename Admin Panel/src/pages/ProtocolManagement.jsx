import { useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { Callout } from '../components/DemoBanner';
import { Drawer } from '../components/Drawer';
import { EmptyState } from '../components/EmptyState';
import { fieldProps, FormField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';
import { PageSkeleton } from '../components/LoadingSkeleton';
import { StatusBadge } from '../components/StatusBadge';
import { useToast } from '../components/ToastProvider';
import { useSnapshot } from '../hooks/useSnapshot';
import { updateProtocol } from '../services/api';
import { FAMILIES } from '../utils/constants';
import { formatDateTime } from '../utils/format';

export function ProtocolManagement() {
  const { data, loading, error, reload } = useSnapshot();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (data?.protocols || []).filter((item) => !term || `${item.identifier} ${item.name} ${item.description}`.toLowerCase().includes(term));
  }, [data, query]);

  function open(protocol) {
    setSelected(protocol);
    setForm({ name: protocol.name, description: protocol.description, enabled: protocol.enabled });
    setErrors({});
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProtocol(selected.id, form);
      setSelected(updated);
      toast.success('Protocol display settings saved.');
    } catch (err) {
      setErrors(err.fields || {});
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading && !data) return <PageSkeleton />;
  if (!data) return <EmptyState title="Protocols could not be loaded" description={error?.message} action={<Button onClick={() => reload()}>Try again</Button>} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuration"
        title="Protocol management"
        description="Project-defined identifiers and messaging standards used as form metadata. Numeric 100-series and 200-series values are not claimed as public standards."
      />
      <Callout tone="info" title="What these records are">
        Online identifiers 101.1–101.3 and offline identifiers 201.1–201.3 are configurable labels from the project requirements. ISO 8583 and ISO 20022 are real messaging standards, but this screen only stores display metadata. Actual support needs a future backend and institution-specific specifications.
      </Callout>
      <FormField label="Search protocols" htmlFor="protocol-search">
        <input id="protocol-search" className="field max-w-md" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by identifier or name" />
      </FormField>
      {FAMILIES.map((family) => {
        const items = filtered.filter((item) => item.family === family.id);
        return (
          <section key={family.id} className="space-y-3">
            <div>
              <h2 className="text-base font-semibold">{family.label}</h2>
              <p className="text-sm text-muted">{family.hint}</p>
            </div>
            {items.length === 0 ? <p className="text-sm text-muted">No identifiers match this search.</p> : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((protocol) => {
                  const server = data.serverProfiles.find((item) => item.id === protocol.serverProfileId);
                  return (
                    <article key={protocol.id} className="card flex flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-serif text-2xl tracking-tight">{protocol.identifier}</p>
                          <h3 className="mt-1 font-medium">{protocol.name}</h3>
                        </div>
                        <StatusBadge kind="protocol" status={protocol.availability} />
                      </div>
                      <p className="mt-3 flex-1 text-sm leading-6 text-muted">{protocol.description}</p>
                      <dl className="mt-4 space-y-1 text-sm">
                        <div className="flex justify-between gap-3"><dt className="text-muted">Server profile</dt><dd className="text-right">{server?.name || 'Unassigned'}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="text-muted">Enabled</dt><dd>{protocol.enabled ? 'Yes' : 'No'}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="text-muted">Updated</dt><dd>{formatDateTime(protocol.updatedAt)}</dd></div>
                      </dl>
                      <Button className="mt-4" variant="outline" onClick={() => open(protocol)}>View details</Button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      <Drawer open={Boolean(selected)} title={selected ? selected.identifier : 'Protocol'} onClose={() => setSelected(null)}>
        {selected && form ? (
          <div className="space-y-5">
            <StatusBadge kind="protocol" status={selected.availability} />
            {selected.availability === 'requires_backend' ? (
              <Callout tone="warning" title="Future backend required">
                Selecting this identifier in a demo form stores metadata only. It does not open a session or send a message.
              </Callout>
            ) : null}
            <p className="text-sm leading-6 text-muted">The identifier and family are fixed. You can edit the display name, description, and enabled flag.</p>
            <form className="space-y-4" onSubmit={save}>
              <FormField label="Display name" htmlFor="protocol-name" required error={errors.name}>
                <input {...fieldProps('protocol-name', errors.name)} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </FormField>
              <FormField label="Short description" htmlFor="protocol-description" required error={errors.description}>
                <textarea {...fieldProps('protocol-description', errors.description)} rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              </FormField>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.enabled} onChange={(event) => setForm({ ...form, enabled: event.target.checked })} />
                Enabled for selection
              </label>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
                <Button type="submit" loading={saving}>Save display settings</Button>
              </div>
            </form>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
