import { Callout } from './DemoBanner';
import { fieldProps, FormField } from './FormField';
import { Hint } from './Tooltip';
import { FAMILIES } from '../utils/constants';

export function ConfigurationStep({ form, update, errors, data }) {
  const servers = data.serverProfiles.filter((item) => item.enabled && item.protocolFamily === form.protocolFamily);
  const protocols = data.protocols.filter((item) => item.family === form.protocolFamily);
  const selected = data.protocols.find((item) => item.identifier === form.protocolIdentifier);
  const server = data.serverProfiles.find((item) => item.id === form.serverProfileId);

  return (
    <div className="space-y-5">
      <Callout tone="warning" title="Load and unload are intents only">
        Choosing Load or Unload creates a simulated record. This form does not load funds, unload funds, change a balance, or contact a financial institution.
      </Callout>
      <div className="grid gap-3 sm:grid-cols-2">
        {['load', 'unload'].map((type) => (
          <label key={type} className={`cursor-pointer rounded-card border p-4 ${form.transactionType === type ? 'border-brand bg-soft' : 'border-line'}`}>
            <input className="sr-only" type="radio" name="transactionType" value={type} checked={form.transactionType === type} onChange={() => update({ transactionType: type })} />
            <span className="block font-medium capitalize">{type}</span>
            <span className="mt-1 block text-sm text-muted">{type === 'load' ? 'Demo intent to add value' : 'Demo intent to remove value'}</span>
          </label>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Protocol family" htmlFor="family" required error={errors.protocolFamily}>
          <select
            {...fieldProps('family', errors.protocolFamily)}
            value={form.protocolFamily}
            onChange={(event) => update({ protocolFamily: event.target.value, protocolIdentifier: '', serverProfileId: '' })}
          >
            {FAMILIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </FormField>
        <FormField label="Protocol identifier" htmlFor="protocol" required error={errors.protocolIdentifier} hint="These labels come from the project requirements. They are not a certification of network support.">
          <select {...fieldProps('protocol', errors.protocolIdentifier, true)} value={form.protocolIdentifier} onChange={(event) => update({ protocolIdentifier: event.target.value })}>
            <option value="">Select an identifier</option>
            {protocols.map((item) => <option key={item.id} value={item.identifier}>{item.identifier} · {item.name}</option>)}
          </select>
        </FormField>
      </div>
      {selected?.availability === 'requires_backend' ? (
        <Callout tone="warning" title="Future backend required">
          {selected.identifier} can be stored on a demo record, but this frontend will not execute it. ISO 8583 and ISO 20022 still need institution-specific specifications. The record will be saved as Pending (Demo).
        </Callout>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Demo server profile" htmlFor="server" required error={errors.serverProfileId}>
          <select
            {...fieldProps('server', errors.serverProfileId)}
            value={form.serverProfileId}
            onChange={(event) => {
              const profile = data.serverProfiles.find((item) => item.id === event.target.value);
              update({ serverProfileId: event.target.value, currency: profile?.defaultCurrency || form.currency });
            }}
          >
            <option value="">Select a profile</option>
            {servers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </FormField>
        <FormField label="Environment label" htmlFor="environment" hint="Taken from the selected demo profile.">
          <input id="environment" className="field" value={server?.environment || 'Select a profile'} readOnly />
        </FormField>
      </div>
      <FormField label="Currency" htmlFor="currency" required error={errors.currency} hint={<Hint text="This selects display currency for the demo amount. It does not convert or settle funds.">Display currency only</Hint>}>
        <select {...fieldProps('currency', errors.currency)} value={form.currency} onChange={(event) => update({ currency: event.target.value })}>
          {data.currencies.filter((item) => item.enabled).map((item) => (
            <option key={item.code} value={item.code}>{item.code} · {item.name}</option>
          ))}
        </select>
      </FormField>
    </div>
  );
}
