'use client';

import { useState } from 'react';
import { Order } from '@/types/order';
import { QRCodeSVG } from 'qrcode.react';

interface SwishInfoProps {
  order: Order;
  onSubmit: (swishName: string, swishNbr: string) => void;
}

export function SwishInfo({ order, onSubmit }: SwishInfoProps) {
  const [swishName, setSwishName] = useState('');
  const [swishNbr, setSwishNbr] = useState('');
  const [errors, setErrors] = useState<{ swishName?: string; swishNbr?: string }>({});
  const [showDialog, setShowDialog] = useState(false);

  const validate = () => {
    const newErrors: { swishName?: string; swishNbr?: string } = {};

    if (!swishName.trim()) {
      newErrors.swishName = 'You have to enter a name so that people can confirm that they typed the phone number correctly.';
    } else if (swishName.trim().length > 50) {
      newErrors.swishName = 'Please enter a valid name';
    }

    if (!swishNbr.trim()) {
      newErrors.swishNbr = 'You have to enter a phone number connected to swish';
    } else if (swishNbr.trim().length > 15) {
      newErrors.swishNbr = 'Please enter a phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setShowDialog(true);
  };

  const confirmSubmit = () => {
    onSubmit(swishName.trim(), swishNbr.trim());
    setShowDialog(false);
  };

  const openSwish = () => {
    if (!order.swishNbr) return;

    const jsonString = JSON.stringify({
      version: 1,
      payee: { value: order.swishNbr },
      message: { editable: true, value: 'EatIT ' + order.hash }
    });

    window.location.href = encodeURI('swish://payment?data=' + jsonString);
  };

  // If swish info is already set, show the payment interface
  if (order.swishNbr && order.swishName) {
    const swishQrString = `C${order.swishNbr};;${'EatIT ' + order.hash};6`;

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">{order.swishNbr} - {order.swishName}</h2>
        <div className="space-y-4">
          <button
            onClick={openSwish}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 font-medium"
          >
            Tap to pay with Swish
          </button>
          <p className="text-sm text-gray-600">
            Link only works on mobile devices with the Swish app installed, alternatively you can scan this code with the Swish app:
          </p>
          <div className="flex justify-center">
            <QRCodeSVG value={swishQrString} size={200} />
          </div>
        </div>
      </div>
    );
  }

  // Show the form to set swish info
  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Swish</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="swishName" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="swishName"
              type="text"
              value={swishName}
              onChange={(e) => setSwishName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a name to let people know who they are paying"
            />
            {errors.swishName && (
              <p className="mt-1 text-sm text-red-600">{errors.swishName}</p>
            )}
          </div>

          <div>
            <label htmlFor="swishNbr" className="block text-sm font-medium text-gray-700 mb-1">
              Phone number
            </label>
            <input
              id="swishNbr"
              type="text"
              value={swishNbr}
              onChange={(e) => setSwishNbr(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a valid phone number that is connected to swish"
            />
            {errors.swishNbr && (
              <p className="mt-1 text-sm text-red-600">{errors.swishNbr}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-2">Are you sure?</h3>
            <p className="text-gray-600 mb-6">Settings swish options cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
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
