import { ArrowLeftRight } from 'lucide-react';
import { ButtonLink } from '../components/Button';
import { Callout } from '../components/DemoBanner';
import { PageHeader } from '../components/PageHeader';

export function PlannedTransfer() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Coming in Milestone 2–3"
        title="Transfer / Download Panel"
        description="This area is reserved. Live transfers, file downloads from institutions, and settlement files are not available in Milestone 1."
      />
      <div className="card p-6">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-900">
          <ArrowLeftRight className="h-5 w-5" />
        </div>
        <Callout tone="warning" title="Not a live transfer screen">
          Nothing on this page sends, receives, or downloads funds. A later milestone will design the transfer and download workflow against an authorized backend.
        </Callout>
        <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
          <li>Planned scope includes transfer preparation screens and download history.</li>
          <li>Those screens will still need an authorized backend before any institution is involved.</li>
          <li>Milestone 1 stops at demo records, configuration, and local tracking.</li>
        </ul>
        <div className="mt-6">
          <ButtonLink to="/" variant="outline">Return to this panel</ButtonLink>
        </div>
      </div>
    </div>
  );
}
