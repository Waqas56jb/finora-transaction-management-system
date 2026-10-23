import { useState } from 'react';
import { Button } from '../components/Button';
import { Callout } from '../components/DemoBanner';
import { FormField } from '../components/FormField';
import { PageHeader } from '../components/PageHeader';
import { useToast } from '../components/ToastProvider';
import { usePreferences } from '../hooks/usePreferences';
import { useSnapshot } from '../hooks/useSnapshot';
import { PAGE_SIZE_OPTIONS } from '../utils/constants';

export function Settings() {
  const { prefs, update } = usePreferences();
  const { data } = useSnapshot();
  const toast = useToast();
  const [draft, setDraft] = useState(prefs);

  function setNotification(key, value) {
    setDraft((current) => ({ ...current, notifications: { ...current.notifications, [key]: value } }));
  }

  function save(event) {
    event.preventDefault();
    if (!draft.displayName.trim() || !draft.operatorName.trim()) {
      toast.error('Display name and operator name are required.');
      return;
    }
    update({
      ...draft,
      displayName: draft.displayName.trim(),
      operatorName: draft.operatorName.trim(),
      pageSize: Number(draft.pageSize),
    });
    toast.success('Preferences saved on this device.');
  }

  const currencies = data?.currencies?.length ? data.currencies : [{ code: 'USD', name: 'US Dollar' }];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Interface preferences for this panel. Nothing here is a payment credential, and values stay in local storage on this browser."
      />
      <Callout tone="neutral">
        Theme, page size, and notification choices are harmless display settings. API secrets, passwords, and card data are not stored.
      </Callout>
      <form className="card max-w-2xl space-y-5 p-5" onSubmit={save}>
        <FormField label="Application display name" htmlFor="display-name" required>
          <input id="display-name" className="field" value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} />
        </FormField>
        <FormField label="Operator display name" htmlFor="operator-name" required hint="Shown in the profile menu. This is not an authenticated user.">
          <input id="operator-name" className="field" value={draft.operatorName} onChange={(event) => setDraft({ ...draft, operatorName: event.target.value })} />
        </FormField>
        <FormField label="Preferred currency" htmlFor="pref-currency" hint="Used as a display default. It does not convert amounts.">
          <select id="pref-currency" className="field" value={draft.currency} onChange={(event) => setDraft({ ...draft, currency: event.target.value })}>
            {currencies.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.name}</option>)}
          </select>
        </FormField>
        <fieldset>
          <legend className="text-sm font-medium">Theme preference</legend>
          <div className="mt-2 flex gap-4 text-sm">
            {['light', 'dark'].map((theme) => (
              <label key={theme} className="flex items-center gap-2 capitalize">
                <input
                  type="radio"
                  name="theme"
                  value={theme}
                  checked={draft.theme === theme}
                  onChange={() => {
                    setDraft({ ...draft, theme });
                    update({ theme });
                  }}
                />
                {theme}
              </label>
            ))}
          </div>
        </fieldset>
        <FormField label="Table page size" htmlFor="page-size">
          <select id="page-size" className="field max-w-xs" value={draft.pageSize} onChange={(event) => setDraft({ ...draft, pageSize: Number(event.target.value) })}>
            {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size} rows</option>)}
          </select>
        </FormField>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Notification preferences</legend>
          {[
            ['inApp', 'Show in-app alerts'],
            ['connectionAlerts', 'Include simulated connection alerts'],
            ['workflowAlerts', 'Include demo workflow alerts'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={draft.notifications[key]} onChange={(event) => setNotification(key, event.target.checked)} />
              {label}
            </label>
          ))}
        </fieldset>
        <Button type="submit">Save preferences</Button>
      </form>
    </div>
  );
}
