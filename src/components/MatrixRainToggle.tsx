'use client';

import { useEffect, useState } from 'react';
import { MatrixRain } from './MatrixRain';

const STORAGE_KEY = 'eatit:matrix-rain';

// Opt-in switch for the matrix rain background, remembered per browser
export function MatrixRainToggle() {
  const [enabled, setEnabled] = useState(false);

  // Read after mount so the server render and first client render match
  useEffect(() => {
    setEnabled(localStorage.getItem(STORAGE_KEY) === 'on');
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off');
  };

  return (
    <>
      {enabled && <MatrixRain />}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={toggle}
        className="fixed left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-gray-800/90 px-3 py-1.5 text-sm text-gray-200 shadow-lg hover:bg-gray-700"
      >
        <span
          aria-hidden="true"
          className={`relative h-5 w-9 rounded-full transition-colors ${enabled ? 'bg-green-600' : 'bg-gray-600'}`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-4' : ''}`}
          />
        </span>
        Matrix mode
      </button>
    </>
  );
}
