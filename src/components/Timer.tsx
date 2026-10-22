'use client';

import { useState, useEffect } from 'react';
import { Card, ConfirmDialog, Field, inputClass } from '@/components/ui';

interface TimerProps {
  hasOrders: boolean;
  timerStarted: boolean;
  timeEnd?: number;
  onSetTimer: (timerEnd: number) => void;
}

const secondsUntil = (timeEnd: number) => Math.max(0, Math.ceil((timeEnd - Date.now()) / 1000));

// Confetti cannons from both bottom corners, loaded only when needed
async function fireConfetti() {
  const { default: confetti } = await import('canvas-confetti');
  const cannon = { particleCount: 80, spread: 55, startVelocity: 65, disableForReducedMotion: true };
  for (const delay of [0, 400, 800]) {
    setTimeout(() => {
      confetti({ ...cannon, angle: 60, origin: { x: 0, y: 1 } });
      confetti({ ...cannon, angle: 120, origin: { x: 1, y: 1 } });
    }, delay);
  }
}

function CountDown({ timeEnd }: { timeEnd: number }) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    setSecondsLeft(secondsUntil(timeEnd));
    // Already done when the page was opened, so no countdown and no confetti
    if (secondsUntil(timeEnd) === 0) return;

    const intervalId = setInterval(() => {
      const seconds = secondsUntil(timeEnd);
      setSecondsLeft(seconds);
      if (seconds === 0) {
        clearInterval(intervalId);
        fireConfetti();
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [timeEnd]);

  if (secondsLeft === null) return <h3 className="text-4xl font-bold">&nbsp;</h3>;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  return <h3 className="text-4xl font-bold">{`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`}</h3>;
}

export function Timer({ hasOrders, timerStarted, timeEnd, onSetTimer }: TimerProps) {
  const [minutes, setMinutes] = useState('');
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
          <CountDown timeEnd={timeEnd} />
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
            onSetTimer(Date.now() + parseInt(minutes, 10) * 60000);
            setShowDialog(false);
          }}
          onCancel={() => setShowDialog(false)}
        />
      )}
    </>
  );
}
