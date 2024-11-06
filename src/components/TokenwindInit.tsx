import { useEffect } from 'react';

export default function TokenwindInit() {
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
    return 'light';
  }
  useEffect(() => {
    if (getInitialColorMode() === 'light') document.documentElement.classList.remove('dark');
    else document.documentElement.classList.add('dark');

    console.log('TEST ', getInitialColorMode());
  }, []);
  return null;
}
