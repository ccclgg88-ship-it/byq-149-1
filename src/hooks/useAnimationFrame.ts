import { useEffect, useRef } from 'react';

export function useAnimationFrame(callback: (delta: number, elapsed: number) => void, enabled = true) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;
    const animate = (time: number) => {
      if (previousTimeRef.current === undefined) {
        previousTimeRef.current = time;
        startTimeRef.current = time;
      }
      const delta = time - previousTimeRef.current;
      const elapsed = time - (startTimeRef.current ?? time);
      previousTimeRef.current = time;
      callbackRef.current(delta, elapsed);
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = undefined;
      startTimeRef.current = undefined;
    };
  }, [enabled]);
}
