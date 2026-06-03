import cfg from './config.js';
import crypto from 'crypto';

export function isRazorpayConfigured() {
  return !!(cfg.razorpayKeyId && cfg.razorpayKeySecret);
}

export async function createRazorpayOrder({ amount, currency = 'INR', receipt }) {
  if (!isRazorpayConfigured()) throw new Error('Razorpay not configured');

  const auth = Buffer.from(`${cfg.razorpayKeyId}:${cfg.razorpayKeySecret}`).toString('base64');
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount: Math.round(amount * 100), currency, receipt }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.description || 'Failed to create Razorpay order');
  }

  return res.json();
}

export function verifyRazorpaySignature(orderId, paymentId, signature) {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', cfg.razorpayKeySecret)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}
