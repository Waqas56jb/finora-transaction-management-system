import { useState } from 'react';
import { Button } from '../components/Button';
import { Callout } from '../components/DemoBanner';
import { EmptyState } from '../components/EmptyState';
import { FormField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';
import { PageSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../components/ToastProvider';
import { usePreferences } from '../hooks/usePreferences';
import { useSnapshot } from '../hooks/useSnapshot';
import { updateCurrency } from '../services/api';
import { formatMoney } from '../utils/format';

const SAMPLE = 1234.5;

export function CurrencyManagement() {
  const { data, loading, error, reload } = useSnapshot();
  const { prefs, update } = usePreferences();
  const toast = useToast();
  const [preview, setPreview] = useState(prefs.currency || 'USD');
  const [busy, setBusy] = useState('');

  async function toggle(currency) {
    setBusy(currency.code);
    try {
      await updateCurrency(currency.code, { enabled: !currency.enabled });
      toast.success(`${currency.code} ${currency.enabled ? 'disabled' : 'enabled'} for demo forms.`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy('');
    }
  }

  if (loading && !data) return <PageSkeleton />;
  if (!data) return <EmptyState title="Currencies could not be loaded" description={error?.message} action={<Button onClick={() => reload()}>Try again</Button>} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuration"
        title="Currency management"
        description="Choose which currency codes appear in demo forms, and preview how amounts are formatted. This is display formatting only."
      />
      <Callout tone="info" title="Not an exchange rate">
        The preview shows the same numeric amount with a different currency format. It is not a market rate, a conversion, or a settlement figure.
      </Callout>
      <section className="card p-5">
        <FormField label="Preview currency" htmlFor="preview-currency" hint="Preferred display currency is also saved with your interface settings.">
          <select
            id="preview-currency"
            className="field max-w-xs"
            value={preview}
            onChange={(event) => {
              setPreview(event.target.value);
              update({ currency: event.target.value });
            }}
          >
            {data.currencies.map((item) => (
              <option key={item.code} value={item.code}>{item.code} · {item.name}</option>
            ))}
          </select>
        </FormField>
        <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight">{formatMoney(SAMPLE, preview)}</p>
        <p className="mt-1 text-sm text-muted">Sample amount 1234.50 formatted as {preview}.</p>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {data.currencies.map((currency) => (
          <article key={currency.code} className="card flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-lg font-semibold">{currency.code} <span className="text-muted">{currency.symbol}</span></p>
              <p className="text-sm text-muted">{currency.name}</p>
              <p className="mt-2 text-sm tabular-nums">{formatMoney(SAMPLE, currency.code)}</p>
            </div>
            <button
              type="button"
              className={`btn ${currency.enabled ? 'btn-primary' : 'btn-outline'}`}
              aria-pressed={currency.enabled}
              disabled={busy === currency.code}
              onClick={() => toggle(currency)}
            >
              {currency.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
