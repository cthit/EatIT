'use client';

import { useState, useEffect } from 'react';

interface TimerProps {
  hasOrders: boolean;
  timerStarted: boolean;
  timeEnd?: number;
  onSetTimer: (timerEnd: number, playEatITSong: boolean) => void;
  onExpiry: () => void;
}

function CountDown({ timeEnd, onExpiry }: { timeEnd: number; onExpiry: () => void }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      let seconds = Math.floor((timeEnd - now) / 1000);

      if (!expired && seconds <= 1) {
        setExpired(true);
        onExpiry();
      }

      const mins = Math.floor(seconds / 60);
      seconds = seconds % 60;

      let prefix = '';
      if (mins < 0 || seconds < 0) {
        prefix = '-';
      }

      const absMins = Math.abs(mins);
      const absSecs = Math.abs(seconds);
      const formattedMins = absMins < 10 ? '0' + absMins : absMins;
      const formattedSecs = absSecs < 10 ? '0' + absSecs : absSecs;

      setTimeLeft(prefix + formattedMins + ':' + formattedSecs);
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 500);

    return () => clearInterval(intervalId);
  }, [timeEnd, expired, onExpiry]);

  return <h3 className="text-4xl font-bold">{timeLeft}</h3>;
}

export function Timer({ hasOrders, timerStarted, timeEnd, onSetTimer, onExpiry }: TimerProps) {
  const [minutes, setMinutes] = useState('');
  const [playEatITSong, setPlayEatITSong] = useState(false);
  const [error, setError] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const minutesNum = parseInt(minutes, 10);

    if (!minutes) {
      setError('This field is required to start a timer');
      return;
    }

    if (isNaN(minutesNum) || minutesNum <= 0) {
      setError('Must be a positive number');
      return;
    }

    setError('');
    setShowDialog(true);
  };

  const confirmSetTimer = () => {
    const minutesNum = parseInt(minutes, 10);
    const timerEnd = new Date().getTime() + minutesNum * 60000;
    onSetTimer(timerEnd, playEatITSong);
    setShowDialog(false);
  };

  if (timerStarted && timeEnd) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Time until food&apos;s ready</h2>
        <div className="flex justify-center">
          <CountDown timeEnd={timeEnd} onExpiry={onExpiry} />
        </div>
      </div>
    );
  }

  if (!hasOrders) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 min-h-[150px]">
        <h2 className="text-2xl font-bold mb-4">Enter time until delivery</h2>
        <div className="flex items-center justify-center py-8">
          <p className="text-xl text-gray-500">
            There must exist orders to be able to set a timer
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Enter time until delivery</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="minutes" className="block text-sm font-medium text-gray-700 mb-1">
              Minutes
            </label>
            <input
              id="minutes"
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="The number of minutes until the food is here"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex items-center">
            <input
              id="playEatITSong"
              type="checkbox"
              checked={playEatITSong}
              onChange={(e) => setPlayEatITSong(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="playEatITSong" className="ml-2 block text-sm text-gray-900">
              Play EatIT video after the timer is done
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Set timer
          </button>
        </form>
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-2">Are you sure?</h3>
            <p className="text-gray-600 mb-6">You cannot reverse this step.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmSetTimer}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
