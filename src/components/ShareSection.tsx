'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface ShareSectionProps {
  url: string;
  restaurant?: {
    restaurantName: string;
    linkToMenu: string;
  };
}

export function ShareSection({ url, restaurant }: ShareSectionProps) {
  const [showQr, setShowQr] = useState(false);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 3000);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied!');
    } catch (err) {
      console.error('Failed to copy:', err);
      showToast('Failed to copy link');
    }
  };

  const renderLinkToMenu = () => {
    if (!restaurant) {
      return (
        <div className="space-y-2">
          <p className="text-gray-700">Don&apos;t know what you want yet?</p>
          <a
            href="https://mat.chalmers.it"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-bold"
            title="Mat vid campus Johanneberg"
          >
            mat.chalmers.it
          </a>
        </div>
      );
    }

    let menuLink = restaurant.linkToMenu;
    if (!menuLink.startsWith('http')) {
      menuLink = 'https://mat.chalmers.it' + menuLink;
    }

    return (
      <div className="space-y-2">
        <p className="text-gray-700">
          This EatIT are ordering from: <span className="font-bold">{restaurant.restaurantName}</span>
        </p>
        <p className="text-gray-700">
          Link to menu:{' '}
          <a
            href={menuLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-bold"
          >
            {menuLink}
          </a>
        </p>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Share</h2>
        <div className="space-y-4">
          {renderLinkToMenu()}

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
      </div>

      {toast.show && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg">
          {toast.message}
        </div>
      )}
    </>
  );
}
