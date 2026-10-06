'use client';

import { useState } from 'react';
import { Order } from '@/types/order';
import { QRCodeSVG } from 'qrcode.react';
import { Card, ConfirmDialog, Field, inputClass } from '@/components/ui';

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
    return (
      <Card title={`${order.swishNbr} - ${order.swishName}`}>
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
            <QRCodeSVG value={`C${order.swishNbr};;EatIT ${order.hash};6`} size={200} />
          </div>
        </div>
      </Card>
    );
  }

  // Show the form to set swish info
  return (
    <>
      <Card title="Swish">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (validate()) setShowDialog(true);
          }}
        >
          <Field label="Name" htmlFor="swishName" error={errors.swishName}>
            <input
              id="swishName"
              type="text"
              value={swishName}
              onChange={(e) => setSwishName(e.target.value)}
              className={inputClass}
              placeholder="Enter a name to let people know who they are paying"
            />
          </Field>

          <Field label="Phone number" htmlFor="swishNbr" error={errors.swishNbr}>
            <input
              id="swishNbr"
              type="text"
              value={swishNbr}
              onChange={(e) => setSwishNbr(e.target.value)}
              className={inputClass}
              placeholder="Enter a valid phone number that is connected to swish"
            />
          </Field>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </Card>

      {showDialog && (
        <ConfirmDialog
          message="Settings swish options cannot be undone."
          onConfirm={() => {
            onSubmit(swishName.trim(), swishNbr.trim());
            setShowDialog(false);
          }}
          onCancel={() => setShowDialog(false)}
        />
      )}
    </>
  );
}
