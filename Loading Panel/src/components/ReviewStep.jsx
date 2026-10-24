import { Button } from './Button';
import { Callout } from './DemoBanner';
import { maskedAccount } from '../utils/transactionForm';
import { ACCOUNT_LABEL, FAMILY_LABEL, TYPE_LABEL } from '../utils/constants';
import { formatMoney } from '../utils/format';

export function ReviewStep({ form, data, errors, onEdit }) {
  const server = data.serverProfiles.find((item) => item.id === form.serverProfileId);
  const protocol = data.protocols.find((item) => item.identifier === form.protocolIdentifier);
  const amount = Number(form.amount);
  return (
    <div className="space-y-4">
      {protocol?.availability === 'requires_backend' ? (
        <Callout tone="warning" title="This record will stay pending">
          {protocol.identifier} needs a future backend. Creating the record does not send a message.
        </Callout>
      ) : null}
      <Callout tone="warning">No funds will be loaded, unloaded, or settled when you continue.</Callout>
      {Object.keys(errors).length ? <p className="text-sm text-rose-700">Some required demo fields still need attention. Use Edit on the relevant section.</p> : null}
      <Summary title="Configuration" onEdit={() => onEdit(1)}>
        <Line label="Demo server" value={server?.name || 'Not selected'} />
        <Line label="Environment" value={server?.environment || '—'} />
        <Line label="Protocol" value={form.protocolIdentifier ? `${form.protocolIdentifier} · ${FAMILY_LABEL[form.protocolFamily]}` : 'Not selected'} />
        <Line label="Transaction type" value={TYPE_LABEL[form.transactionType]} />
        <Line label="Currency" value={form.currency} />
      </Summary>
      <Summary title="Account" onEdit={() => onEdit(2)}>
        <Line label="Account type" value={ACCOUNT_LABEL[form.accountType]} />
        <Line label="Masked identifier" value={maskedAccount(form) || 'Not ready'} />
        <Line label="Label" value={form.displayLabel || '—'} />
      </Summary>
      <Summary title="Transaction" onEdit={() => onEdit(3)}>
        <Line label="Amount" value={Number.isFinite(amount) ? formatMoney(amount || 0, form.currency) : '—'} />
        <Line label="Description" value={form.description || '—'} />
        <Line label="Sender" value={`${form.senderName || '—'} · ${form.senderInstitution || ''}`} />
        <Line label="Receiver" value={`${form.receiverName || '—'} · ${form.receiverInstitution || ''}`} />
      </Summary>
    </div>
  );
}

function Summary({ title, onEdit, children }) {
  return (
    <section className="rounded-card border border-line p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-semibold">{title}</h3>
        <Button variant="ghost" onClick={onEdit}>Edit</Button>
      </div>
      <dl className="space-y-2 text-sm">{children}</dl>
    </section>
  );
}

function Line({ label, value }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium">{value}</dd>
    </div>
  );
}
