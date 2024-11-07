import { useState } from 'react';
import { beforeThemeTransition } from '../../styles/tokenwind/utils';

export default function TokenwindSwitch() {
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));

  const toggle = () => {
    beforeThemeTransition();
    const newMode = !darkMode;
    localStorage.theme = newMode ? 'dark' : 'light';

    setDarkMode(newMode);

    const isDarkMode = document.documentElement.classList.contains('dark');
    const mode = isDarkMode ? 'dark' : 'light';
    const opposite = isDarkMode ? 'light' : 'dark';

    if (document.documentElement.classList.contains(opposite)) {
      document.documentElement.classList.replace(opposite, mode);
    }
    document.documentElement.classList.remove(mode);
    document.documentElement.classList.add(opposite);

    window.localStorage.setItem('tokenwind-mode', opposite);
  };

  return (
    <>
      CURRENT MODE: {darkMode ? 'DARK MODE ' : 'LIGHT MODE'}
      <button onClick={toggle} className="rounded border border-black p-2 font-bold text-red-900">
        Toggle
      </button>
    </>
  );
}
