import { Check } from 'lucide-react';

export function TransactionTimeline({ events = [] }) {
  return (
    <ol className="space-y-0">
      {events.map((item, index) => (
        <li key={item.id} className="relative flex gap-3 pb-5">
          {index < events.length - 1 ? <span className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-px bg-line" aria-hidden="true" /> : null}
          <span className="relative z-[1] mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-soft text-brand">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{item.detail}</p>
            <p className="mt-1 text-xs text-muted">{new Date(item.at).toLocaleString()} · Simulated</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
