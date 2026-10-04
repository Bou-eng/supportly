import { useRef, useState } from 'react';

export const useActionLock = () => {
  const lockedRef = useRef(false);
  const [locked, setLocked] = useState(false);

  const runOnce = async (action) => {
    if (lockedRef.current) return false;
    lockedRef.current = true;
    setLocked(true);
    try {
      await action();
      return true;
    } finally {
      lockedRef.current = false;
      setLocked(false);
    }
  };

  return { locked, runOnce };
};