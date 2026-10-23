import { ACCOUNT_TYPES, COUNTRIES, WALLET_NETWORKS } from '../utils/constants';
import { Callout } from './DemoBanner';
import { fieldProps, FormField } from './FormField';

const YEARS = Array.from({ length: 13 }, (_, index) => new Date().getFullYear() + index);

export function AccountTypeStep({ form, update, errors }) {
  const routingLabel = form.country === 'IN' ? 'Demo IFSC' : 'Demo SWIFT/BIC';
  return (
    <div className="space-y-5">
      <Callout tone="neutral" title="Synthetic details only">
        Do not enter a real card number, security code, PIN, one-time password, banking password, or private key. Only masked demo identifiers are stored.
      </Callout>
      <div className="grid gap-3 md:grid-cols-3">
        {ACCOUNT_TYPES.map((type) => (
          <label key={type.id} className={`cursor-pointer rounded-card border p-4 ${form.accountType === type.id ? 'border-brand bg-soft' : 'border-line'}`}>
            <input className="sr-only" type="radio" name="accountType" value={type.id} checked={form.accountType === type.id} onChange={() => update({ accountType: type.id })} />
            <span className="font-medium">{type.label}</span>
          </label>
        ))}
      </div>
      {errors.accountType ? <p className="text-sm text-rose-700">{errors.accountType}</p> : null}

      {form.accountType === 'card' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Masked demo card number" htmlFor="card-last4" required error={errors.maskedIdentifier} hint="Type four sample digits. The stored value looks like **** **** **** 4242.">
            <input
              {...fieldProps('card-last4', errors.maskedIdentifier, true)}
              inputMode="numeric"
              autoComplete="off"
              name="demo-card-last4"
              maxLength={4}
              placeholder="4242"
              value={form.cardLast4}
              onChange={(event) => update({ cardLast4: event.target.value.replace(/\D/g, '').slice(-4) })}
            />
          </FormField>
          <FormField label="Optional display label" htmlFor="card-label">
            <input {...fieldProps('card-label')} value={form.displayLabel} onChange={(event) => update({ displayLabel: event.target.value })} placeholder="Field kit card" />
          </FormField>
          <FormField label="Expiry month" htmlFor="expiry-month" required error={errors.expiryMonth} hint="Presentation only. It is not checked with an issuer.">
            <select {...fieldProps('expiry-month', errors.expiryMonth, true)} value={form.expiryMonth} onChange={(event) => update({ expiryMonth: event.target.value })}>
              <option value="">Month</option>
              {Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0')).map((month) => <option key={month}>{month}</option>)}
            </select>
          </FormField>
          <FormField label="Expiry year" htmlFor="expiry-year" required error={errors.expiryYear}>
            <select {...fieldProps('expiry-year', errors.expiryYear)} value={form.expiryYear} onChange={(event) => update({ expiryYear: event.target.value })}>
              {YEARS.map((year) => <option key={year}>{year}</option>)}
            </select>
          </FormField>
          <p className="sm:col-span-2 text-sm text-muted">Preview: {form.cardLast4 ? `**** **** **** ${form.cardLast4}` : '**** **** **** ••••'}</p>
        </div>
      ) : null}

      {form.accountType === 'bank' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Demo account number" htmlFor="account-number" required error={errors.maskedIdentifier} hint="Enter 8–17 sample digits. After you leave the field, only the last four are kept.">
            <input
              {...fieldProps('account-number', errors.maskedIdentifier, true)}
              inputMode="numeric"
              autoComplete="off"
              name="demo-account-number"
              placeholder="000111224821"
              value={form.accountMasked && !form.accountDraft ? `******${form.accountLast4}` : form.accountDraft}
              onFocus={() => { if (form.accountMasked) update({ accountMasked: false, accountDraft: '', accountLast4: '' }); }}
              onBlur={(event) => {
                const digits = event.target.value.replace(/\D/g, '');
                if (digits.length >= 8 && digits.length <= 17) {
                  update({ accountDraft: '', accountLast4: digits.slice(-4), accountMasked: true });
                }
              }}
              onChange={(event) => update({ accountDraft: event.target.value.replace(/\D/g, '').slice(0, 17), accountMasked: false })}
            />
          </FormField>
          <FormField label="Optional display label" htmlFor="bank-label">
            <input {...fieldProps('bank-label')} value={form.displayLabel} onChange={(event) => update({ displayLabel: event.target.value })} placeholder="Operations account" />
          </FormField>
          <FormField label="Account holder name" htmlFor="holder" required error={errors.holderName}>
            <input {...fieldProps('holder', errors.holderName)} autoComplete="off" value={form.holderName} onChange={(event) => update({ holderName: event.target.value })} placeholder="Demo Account Holder" />
          </FormField>
          <FormField label="Bank name" htmlFor="bank-name" required error={errors.bankName}>
            <input {...fieldProps('bank-name', errors.bankName)} value={form.bankName} onChange={(event) => update({ bankName: event.target.value })} placeholder="Sample Harbor Bank (Demo)" />
          </FormField>
          <FormField label="Bank address" htmlFor="bank-address" required error={errors.bankAddress}>
            <input {...fieldProps('bank-address', errors.bankAddress)} value={form.bankAddress} onChange={(event) => update({ bankAddress: event.target.value })} placeholder="100 Demonstration Avenue, Sample City" />
          </FormField>
          <FormField label="Country" htmlFor="country" hint="India shows an IFSC format check. Other countries show a SWIFT/BIC format check. Neither is a live lookup.">
            <select {...fieldProps('country', null, true)} value={form.country} onChange={(event) => update({ country: event.target.value, routingCode: '' })}>
              {COUNTRIES.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
            </select>
          </FormField>
          <FormField label={routingLabel} htmlFor="routing" required error={errors.routingCode} hint={form.country === 'IN' ? 'Example shape: DEMO0SAMPLE. Format check only.' : 'Example shape: DEMOUS00XXX. Format check only.'}>
            <input {...fieldProps('routing', errors.routingCode, true)} autoComplete="off" value={form.routingCode} onChange={(event) => update({ routingCode: event.target.value.toUpperCase() })} placeholder={form.country === 'IN' ? 'DEMO0SAMPLE' : 'DEMOUS00XXX'} />
          </FormField>
        </div>
      ) : null}

      {form.accountType === 'wallet' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Demo wallet identifier" htmlFor="wallet-id" required error={errors.walletId} hint="Use a short synthetic label such as demo-wallet-1001.">
            <input {...fieldProps('wallet-id', errors.walletId, true)} autoComplete="off" name="demo-wallet-id" value={form.walletId} onChange={(event) => update({ walletId: event.target.value })} placeholder="demo-wallet-1001" />
          </FormField>
          <FormField label="Wallet provider" htmlFor="wallet-provider" required error={errors.walletProvider}>
            <input {...fieldProps('wallet-provider', errors.walletProvider)} value={form.walletProvider} onChange={(event) => update({ walletProvider: event.target.value })} placeholder="Demo Wallet Co." />
          </FormField>
          <FormField label="Network label" htmlFor="network">
            <select {...fieldProps('network')} value={form.networkLabel} onChange={(event) => update({ networkLabel: event.target.value })}>
              {WALLET_NETWORKS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </FormField>
          <FormField label="Optional display label" htmlFor="wallet-label">
            <input {...fieldProps('wallet-label')} value={form.displayLabel} onChange={(event) => update({ displayLabel: event.target.value })} placeholder="Staff wallet" />
          </FormField>
        </div>
      ) : null}
    </div>
  );
}
