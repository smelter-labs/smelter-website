import { useEffect } from 'react';

export default function TokenwindInit() {
  useEffect(() => {
    function getInitialColorMode() {
      const persistedColorPreference = window.localStorage.getItem('tokenwind-mode');
      const hasPersistedPreference = typeof persistedColorPreference === 'string';
      if (hasPersistedPreference) {
        return persistedColorPreference;
      }
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const hasMediaQueryPreference = typeof mql.matches === 'boolean';
      if (hasMediaQueryPreference) {
        return mql.matches ? 'dark' : 'light';
      }
      return 'dark';
    }

    if (getInitialColorMode() === 'light') document.documentElement.classList.remove('dark');
    else document.documentElement.classList.add('dark');
  }, []);

  return null;
}
