import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import CustomerSession from '@/models/CustomerSession';
import { sendOTP } from '@/lib/email';

function hashOTP(otp, email) {
  return crypto.createHmac('sha256', email.toLowerCase().trim()).update(otp).digest('hex');
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limit: check if OTP was sent in the last 60 seconds
    await connectDB();
    const existing = await CustomerSession.findOne({ email: normalizedEmail });
    if (existing?.otpExpiresAt) {
      const sentAt = new Date(existing.otpExpiresAt.getTime() - 10 * 60 * 1000);
      if (Date.now() - sentAt.getTime() < 60 * 1000) {
        return NextResponse.json({ error: 'Please wait before requesting another OTP.' }, { status: 429 });
      }
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = hashOTP(otp, normalizedEmail);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await CustomerSession.findOneAndUpdate(
      { email: normalizedEmail },
      { email: normalizedEmail, otpHash, otpExpiresAt },
      { upsert: true, new: true }
    );

    await sendOTP(normalizedEmail, otp);

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error('Send OTP error:', err);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
