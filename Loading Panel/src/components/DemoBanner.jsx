import { Info } from 'lucide-react';

export function DemoBanner() {
  return (
    <div className="no-print border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950" role="note">
      <p className="mx-auto flex max-w-6xl items-start gap-2 leading-6">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Demonstration mode. Records, connections, and receipts are simulated on this device. No bank, card network, or settlement system is contacted.</span>
      </p>
    </div>
  );
}

export function DemoModeBanner() {
  return <DemoBanner />;
}

export function Callout({ tone = 'info', title, children }) {
  return (
    <div className={`callout callout-${tone}`} role="note">
      {title ? <p className="font-medium">{title}</p> : null}
      <div className={title ? 'mt-1' : undefined}>{children}</div>
    </div>
  );
}
