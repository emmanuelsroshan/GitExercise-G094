import { useEffect, useRef } from "react";

/**
 * Polls `fn` every `intervalMs` milliseconds while the component is mounted.
 * Stops when `active` is false.
 */
export function usePolling(fn, intervalMs = 4000, active = true) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!active) return;
    fnRef.current();                              // fire immediately
    const id = setInterval(() => fnRef.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, active]);
}
