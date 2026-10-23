import { ACCOUNT_TYPES } from '../utils/constants';
import { applySample } from '../utils/transactionForm';
import { Button } from './Button';
import { Callout } from './DemoBanner';
import { fieldProps, FormField } from './FormField';

export function TransactionDetailsStep({ form, update, errors }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Callout tone="info" title="Sample counterparties">
          Sender and receiver names are sample labels. Entering them does not verify a person or an institution.
        </Callout>
      </div>
      <Button variant="secondary" onClick={() => update(applySample(form))}>Fill sample data</Button>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Amount" htmlFor="amount" required error={errors.amount} hint={`Positive number in ${form.currency}, up to two decimal places. Demo amount only.`}>
          <input {...fieldProps('amount', errors.amount, true)} inputMode="decimal" value={form.amount} onChange={(event) => update({ amount: event.target.value })} placeholder="250.00" />
        </FormField>
        <FormField label="Currency" htmlFor="amount-currency">
          <input id="amount-currency" className="field" value={form.currency} readOnly />
        </FormField>
      </div>
      <FormField label="Transaction description" htmlFor="description" required error={errors.description}>
        <textarea {...fieldProps('description', errors.description)} rows={3} value={form.description} onChange={(event) => update({ description: event.target.value })} placeholder="Demo card load for a sample desk" />
      </FormField>
      <FormField label="Optional reference note" htmlFor="note" error={errors.referenceNote}>
        <input {...fieldProps('note', errors.referenceNote)} value={form.referenceNote} onChange={(event) => update({ referenceNote: event.target.value })} placeholder="Internal demo note" />
      </FormField>
      <div className="grid gap-4 lg:grid-cols-2">
        <PartyFields title="Sender" prefix="sender" form={form} update={update} errors={errors} />
        <PartyFields title="Receiver" prefix="receiver" form={form} update={update} errors={errors} />
      </div>
    </div>
  );
}

function PartyFields({ title, prefix, form, update, errors }) {
  const nameKey = `${prefix}Name`;
  const typeKey = `${prefix}AccountType`;
  const institutionKey = `${prefix}Institution`;
  const addressKey = `${prefix}Address`;
  return (
    <fieldset className="space-y-4 rounded-card border border-line p-4">
      <legend className="px-1 text-sm font-semibold">{title} details · sample data</legend>
      <FormField label={`${title} display name`} htmlFor={nameKey} required error={errors[nameKey]}>
        <input {...fieldProps(nameKey, errors[nameKey])} autoComplete="off" value={form[nameKey]} onChange={(event) => update({ [nameKey]: event.target.value })} />
      </FormField>
      <FormField label={`${title} account type`} htmlFor={typeKey} required error={errors[typeKey]}>
        <select {...fieldProps(typeKey, errors[typeKey])} value={form[typeKey]} onChange={(event) => update({ [typeKey]: event.target.value })}>
          {ACCOUNT_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </FormField>
      <FormField label={`${title} institution or provider`} htmlFor={institutionKey} required error={errors[institutionKey]}>
        <input {...fieldProps(institutionKey, errors[institutionKey])} value={form[institutionKey]} onChange={(event) => update({ [institutionKey]: event.target.value })} placeholder="Sample Harbor Bank (Demo)" />
      </FormField>
      <FormField label={`${title} address`} htmlFor={addressKey} required={form[typeKey] === 'bank'} error={errors[addressKey]} hint={form[typeKey] === 'bank' ? 'Required when the account type is bank.' : 'Optional unless the account type is bank.'}>
        <input {...fieldProps(addressKey, errors[addressKey], true)} value={form[addressKey]} onChange={(event) => update({ [addressKey]: event.target.value })} />
      </FormField>
    </fieldset>
  );
}
