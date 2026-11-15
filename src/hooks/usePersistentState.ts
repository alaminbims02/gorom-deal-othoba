import { useEffect, useState } from 'react';

/** useState that survives reloads (localStorage). Falls back to memory if storage is blocked. */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage blocked or full */
    }
  }, [key, value]);

  return [value, setValue] as const;
}
