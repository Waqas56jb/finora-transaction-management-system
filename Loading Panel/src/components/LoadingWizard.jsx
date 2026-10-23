import { useEffect, useRef, useState } from 'react';
import { useBlocker, useNavigate } from 'react-router-dom';
import { createDemoTransaction } from '../services/api';
import { emptyForm, errorsForStep, toPayload } from '../utils/transactionForm';
import { usePreferences } from '../hooks/usePreferences';
import { useSnapshot } from '../hooks/useSnapshot';
import { AccountTypeStep } from './AccountTypeStep';
import { Button } from './Button';
import { Callout } from './DemoBanner';
import { ConfigurationStep } from './ConfigurationStep';
import { ConfirmDialog } from './ConfirmDialog';
import { PageSkeleton } from './LoadingSkeleton';
import { ReviewStep } from './ReviewStep';
import { TransactionDetailsStep } from './TransactionDetailsStep';
import { useToast } from './ToastProvider';

const STEPS = ['Configuration', 'Account', 'Details', 'Review', 'Submit'];

export function LoadingWizard() {
  const { data, loading, error, reload } = useSnapshot();
  const { prefs } = usePreferences();
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => emptyForm(prefs.currency));
  const [errors, setErrors] = useState({});
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const allowLeave = useRef(false);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => (
    dirty && !allowLeave.current && currentLocation.pathname !== nextLocation.pathname
  ));

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function update(patch) {
    setForm((current) => ({ ...current, ...(typeof patch === 'function' ? patch(current) : patch) }));
    setDirty(true);
  }

  function goNext() {
    const nextErrors = errorsForStep(data, form, step);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setErrors({});
    setStep((current) => Math.min(5, current + 1));
  }

  async function submit() {
    const nextErrors = errorsForStep(data, { ...form, confirmed: form.confirmed }, 5);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const firstStep = [1, 2, 3, 5].find((item) => Object.keys(errorsForStep(data, form, item)).length);
      if (firstStep && firstStep < 5) setStep(firstStep);
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((resolve) => { window.setTimeout(resolve, 700); });
      const record = await createDemoTransaction(toPayload(form));
      allowLeave.current = true;
      setDirty(false);
      toast.success('Demo transaction record created.');
      navigate(`/transactions/${record.reference}`);
    } catch (err) {
      setErrors(err.fields || {});
      toast.error(err.message || 'The demo record could not be created.');
      if (err.fields) {
        const firstStep = [1, 2, 3].find((item) => Object.keys(err.fields).some((key) => key !== 'confirmedSimulation'));
        if (firstStep) setStep(firstStep);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setForm(emptyForm(prefs.currency));
    setStep(1);
    setErrors({});
    setDirty(false);
    setResetOpen(false);
  }

  if (loading && !data) return <PageSkeleton />;
  if (!data) {
    return <button type="button" className="btn btn-primary" onClick={() => reload()}>Retry loading demo configuration</button>;
  }

  return (
    <form
      className="space-y-6"
      autoComplete="off"
      onSubmit={(event) => {
        event.preventDefault();
        if (step < 5) goNext();
        else submit();
      }}
    >
      <ol className="grid grid-cols-5 gap-2" aria-label="Form progress">
        {STEPS.map((label, index) => {
          const number = index + 1;
          const active = number === step;
          const done = number < step;
          return (
            <li key={label}>
              <button
                type="button"
                className={`w-full rounded-control border px-2 py-2 text-left text-xs sm:text-sm ${active ? 'border-brand bg-soft font-medium' : 'border-line'} ${done ? 'text-ink' : 'text-muted'}`}
                onClick={() => { if (number < step) setStep(number); }}
                disabled={number > step}
                aria-current={active ? 'step' : undefined}
              >
                <span className="block text-[10px] uppercase tracking-[0.14em]">Step {number}</span>
                <span className="hidden sm:block">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="card p-5">
        {step === 1 ? <ConfigurationStep form={form} update={update} errors={errors} data={data} /> : null}
        {step === 2 ? <AccountTypeStep form={form} update={update} errors={errors} /> : null}
        {step === 3 ? <TransactionDetailsStep form={form} update={update} errors={errors} /> : null}
        {step === 4 ? <ReviewStep form={form} data={data} errors={errors} onEdit={setStep} /> : null}
        {step === 5 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Submit demo request</h2>
            <Callout tone="warning" title="Simulated record">
              Create Demo Transaction stores a local demo record and a reference such as DEMO-TXN-2026-000017. It does not load a card, move funds, or settle a payment.
            </Callout>
            <label className="flex items-start gap-3 text-sm leading-6">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.confirmed}
                onChange={(event) => update({ confirmed: event.target.checked })}
              />
              <span>I understand this creates a simulated transaction record only. No funds will be loaded, unloaded, or settled.</span>
            </label>
            {errors.confirmedSimulation ? <p className="text-sm text-rose-700" role="alert">{errors.confirmedSimulation}</p> : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap justify-between gap-2">
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setResetOpen(true)}>Reset form</Button>
          {step > 1 ? <Button variant="outline" onClick={() => setStep((current) => current - 1)}>Back</Button> : null}
        </div>
        {step < 5 ? (
          <Button type="submit">Continue</Button>
        ) : (
          <Button type="submit" loading={submitting}>Create Demo Transaction</Button>
        )}
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="Reset this demo form?"
        body="The entries on this form will be cleared. Nothing has been submitted."
        confirmLabel="Reset form"
        tone="danger"
        onConfirm={resetForm}
        onClose={() => setResetOpen(false)}
      />
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Leave this demo form?"
        body="You have unsaved entries. Leaving now discards them. Nothing has been submitted."
        confirmLabel="Discard changes"
        tone="danger"
        onConfirm={() => blocker.proceed?.()}
        onClose={() => blocker.reset?.()}
      />
    </form>
  );
}
