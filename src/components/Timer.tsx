'use client';

import { useState, useEffect } from 'react';
import { Card, ConfirmDialog, Field, inputClass } from '@/components/ui';

interface TimerProps {
  hasOrders: boolean;
  timerStarted: boolean;
  timeEnd?: number;
  onSetTimer: (timerEnd: number, playEatITSong: boolean) => void;
  onExpiry: () => void;
}

function CountDown({ timeEnd, onExpiry }: { timeEnd: number; onExpiry: () => void }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const totalSeconds = Math.floor((timeEnd - now) / 1000);

      if (!expired && totalSeconds <= 1) {
        setExpired(true);
        onExpiry();
      }

      const sign = totalSeconds < 0 ? '-' : '';
      const mins = Math.floor(Math.abs(totalSeconds) / 60);
      const secs = Math.abs(totalSeconds) % 60;
      setTimeLeft(`${sign}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
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

  if (timerStarted && timeEnd) {
    return (
      <Card title="Time until food's ready">
        <div className="flex justify-center">
          <CountDown timeEnd={timeEnd} onExpiry={onExpiry} />
        </div>
      </Card>
    );
  }

  if (!hasOrders) {
    return (
      <Card title="Enter time until delivery" className="min-h-[150px]">
        <div className="flex items-center justify-center py-8">
          <p className="text-xl text-gray-500">
            There must exist orders to be able to set a timer
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card title="Enter time until delivery">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Minutes" htmlFor="minutes" error={error}>
            <input
              id="minutes"
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className={inputClass}
              placeholder="The number of minutes until the food is here"
            />
          </Field>

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
      </Card>

      {showDialog && (
        <ConfirmDialog
          message="You cannot reverse this step."
          onConfirm={() => {
            onSetTimer(Date.now() + parseInt(minutes, 10) * 60000, playEatITSong);
            setShowDialog(false);
          }}
          onCancel={() => setShowDialog(false)}
        />
      )}
    </>
  );
}
