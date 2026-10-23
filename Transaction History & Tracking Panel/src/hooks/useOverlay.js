import { useEffect, useRef } from 'react';

export function useOverlay(open) {
  const ref = useRef(null);
  const onCloseRef = useRef(() => {});

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const root = ref.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusables = () => (root
      ? [...root.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.disabled)
      : []);

    const initial = focusables();
    (initial.find((element) => element.dataset.autofocus === 'true') || initial[0] || root)?.focus();

    function onKey(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      if (previous && typeof previous.focus === 'function') previous.focus();
    };
  }, [open]);

  return { ref, onCloseRef };
}
