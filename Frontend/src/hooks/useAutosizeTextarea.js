import { useEffect, useRef } from 'react';

/**
 * Auto-grows a textarea to fit its content, up to maxHeight (px).
 */
export function useAutosizeTextarea(value, maxHeight = 200) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [value, maxHeight]);

  return ref;
}
