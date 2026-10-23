export function FormField({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  children,
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="flex items-center gap-1 text-sm font-medium text-ink">
        {label}
        {required ? <span className="text-rose-700" aria-hidden="true">*</span> : null}
        {required ? <span className="sr-only">required</span> : null}
      </label>
      {children}
      {error ? <p id={`${htmlFor}-error`} className="text-sm text-rose-700" role="alert">{error}</p> : null}
      {hint ? <p id={`${htmlFor}-hint`} className="text-sm leading-6 text-muted">{hint}</p> : null}
    </div>
  );
}

export function fieldProps(id, error, hint) {
  return {
    id,
    className: error ? 'field field-error' : 'field',
    'aria-invalid': error ? true : undefined,
    'aria-describedby': [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined,
  };
}
