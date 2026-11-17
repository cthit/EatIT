'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui';
import { useToast } from '@/components/useToast';

export function ShareSection() {
  const [showQr, setShowQr] = useState(false);
  const [url, setUrl] = useState('');
  const { toast, showToast } = useToast();

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied!');
    } catch (err) {
      console.error('Failed to copy:', err);
      showToast('Failed to copy link');
    }
  };

  return (
    <>
      <Card title="Share">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-gray-700">Share this link with your friends:</p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
              <button
                onClick={copyToClipboard}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowQr(!showQr)}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {showQr ? 'Hide' : 'Show'} QR Code
          </button>

          {showQr && (
            <div className="flex justify-center">
              <QRCodeSVG value={url} size={200} />
            </div>
          )}
        </div>
      </Card>

      {toast}
    </>
  );
}
