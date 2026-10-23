import { cx } from '../utils/cx';

export function EmptyState({ icon, title, description, action, className }) {
  return (
    <div className={cx('flex flex-col items-center px-6 py-14 text-center', className)}>
      {icon ? <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-soft text-brand">{icon}</div> : null}
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
