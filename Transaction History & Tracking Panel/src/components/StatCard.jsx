import { cx } from '../utils/cx';

export function StatCard({ label, value, hint, icon }) {
  return (
    <article className="card p-5 transition duration-200 hover:-translate-y-0.5 hover:border-stone-300">
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        {icon ? <span className="grid h-9 w-9 place-items-center rounded-xl bg-soft text-brand">{icon}</span> : null}
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-sm leading-6 text-muted">{hint}</p> : null}
    </article>
  );
}

export function SectionCard({ title, description, actions, children, className }) {
  return (
    <section className={cx('card p-5', className)}>
      {title || actions ? (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title ? <h2 className="text-base font-semibold tracking-tight">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm leading-6 text-muted">{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}
