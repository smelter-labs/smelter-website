import { useEffect, useState } from 'react';
import nightwind from 'nightwind/helper';

export default function NightwindSwitch() {
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    nightwind.enable(darkMode);
  }, [darkMode]);

  const toggle = () => {
    const newMode = !darkMode;
    localStorage.theme = newMode ? 'dark' : 'light';
    setDarkMode(newMode);
  };

  return (
    <button onClick={toggle} className="border-black rounded border p-2 font-bold">
      Toggle
    </button>
  );
}
