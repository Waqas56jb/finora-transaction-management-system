export function Tooltip({ text, children }) {
  return (
    <span className="relative inline-flex items-center">
      <button type="button" className="rounded text-muted underline decoration-dotted underline-offset-4 hover:text-ink" aria-describedby={undefined}>
        {children}
      </button>
      <span role="tooltip" className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 hidden w-56 -translate-x-1/2 rounded-control bg-ink px-2.5 py-2 text-left text-xs font-normal leading-5 text-surface shadow-card group-hover:block">
        {text}
      </span>
    </span>
  );
}

export function Hint({ text, children }) {
  return (
    <span className="group relative inline-flex">
      <span tabIndex={0} className="cursor-help rounded text-muted underline decoration-dotted underline-offset-4">
        {children}
      </span>
      <span role="tooltip" className="invisible absolute bottom-[calc(100%+8px)] left-0 z-20 w-64 rounded-control bg-ink px-3 py-2 text-xs font-normal leading-5 text-surface opacity-0 shadow-card transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        {text}
      </span>
    </span>
  );
}
