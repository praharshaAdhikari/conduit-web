import { useEffect, useState } from 'react';
import { useRevalidator } from 'react-router';

const POLL_MS = 1500;
const GIVE_UP_MS = 30000;

/**
 * Reloads the page's data every second and a half until `isDone`, for at most half a minute. Used where the
 * API learns something from the payment provider after the user is already back. Returns whether it gave up.
 */
export function useRevalidateUntil(isDone: boolean) {
  const { revalidate } = useRevalidator();
  const [waitedMs, setWaitedMs] = useState(0);
  const gaveUp = waitedMs >= GIVE_UP_MS;

  useEffect(() => {
    if (isDone || gaveUp) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setWaitedMs((ms) => ms + POLL_MS);
      revalidate();
    }, POLL_MS);

    return () => clearTimeout(timer);
  }, [isDone, gaveUp, waitedMs, revalidate]);

  return gaveUp;
}
