import { useEffect, useState } from 'react';

/**
 * Mengembalikan nilai yang baru diperbarui setelah `value`
 * tidak berubah selama `delay` milidetik.
 */
export function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}