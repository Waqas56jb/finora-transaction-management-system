import { useEffect, useRef } from 'react';

export function useOverlay(open) {
  const ref = useRef(null);
  const onCloseRef = useRef(() => {});

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const root = ref.current;
    const scrollY = window.scrollY;
    const previousStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

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
      document.body.style.overflow = previousStyle.overflow;
      document.body.style.position = previousStyle.position;
      document.body.style.top = previousStyle.top;
      document.body.style.width = previousStyle.width;
      window.scrollTo(0, scrollY);
      document.removeEventListener('keydown', onKey);
      if (previous && typeof previous.focus === 'function') previous.focus();
    };
  }, [open]);

  return { ref, onCloseRef };
}
