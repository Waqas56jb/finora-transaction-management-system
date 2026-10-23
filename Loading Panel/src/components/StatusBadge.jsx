import { statusMeta } from '../utils/status';

const DOT = {
  success: 'bg-emerald-600',
  warning: 'bg-amber-600',
  danger: 'bg-rose-700',
  info: 'bg-sky-800',
  neutral: 'bg-stone-500',
};

export function StatusBadge({ kind = 'transaction', status, label, tone }) {
  const meta = label ? { label, tone: tone || 'neutral' } : statusMeta(kind, status);
  return (
    <span className={`badge badge-${meta.tone}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[meta.tone] || DOT.neutral}`} aria-hidden="true" />
      {meta.label}
    </span>
  );
}
