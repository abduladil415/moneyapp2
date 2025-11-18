import { useCallback, useEffect, useState } from 'react';

export function useHashRoute(defaultRoute = 'dashboard') {
  const [route, setRoute] = useState(() => {
    if (typeof window === 'undefined') return defaultRoute;
    return window.location.hash.replace('#', '') || defaultRoute;
  });

  useEffect(() => {
    const handler = () => setRoute(window.location.hash.replace('#', '') || defaultRoute);
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, [defaultRoute]);

  const navigate = useCallback((next) => {
    if (window.location.hash.replace('#', '') === next) {
      setRoute(next);
    } else {
      window.location.hash = next;
    }
  }, []);

  return [route, navigate];
}
