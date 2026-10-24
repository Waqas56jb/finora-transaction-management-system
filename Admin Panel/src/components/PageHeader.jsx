export function PageHeader({ eyebrow, title, description, meta, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="min-w-0 max-w-3xl">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-1 break-words text-2xl font-semibold tracking-tight md:text-[1.7rem]">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-6 text-muted">{description}</p> : null}
        {meta ? <p className="mt-2 text-sm text-ink">{meta}</p> : null}
      </div>
      {actions ? <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap [&>*]:w-full sm:[&>*]:w-auto">{actions}</div> : null}
    </div>
  );
}
