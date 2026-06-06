import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import CustomerSession from '@/models/CustomerSession';

function hashOTP(otp, email) {
  return crypto.createHmac('sha256', email.toLowerCase().trim()).update(otp).digest('hex');
}

export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    await connectDB();
    const session = await CustomerSession.findOne({ email: normalizedEmail });

    if (!session || !session.otpHash || !session.otpExpiresAt) {
      return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 });
    }

    if (new Date() > session.otpExpiresAt) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    const expectedHash = hashOTP(otp.trim(), normalizedEmail);
    if (!crypto.timingSafeEqual(Buffer.from(session.otpHash), Buffer.from(expectedHash))) {
      return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 });
    }

    // OTP verified — issue session token
    const sessionToken = crypto.randomUUID();
    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    session.sessionToken = sessionToken;
    session.sessionExpiresAt = sessionExpiresAt;
    session.otpHash = null;
    session.otpExpiresAt = null;
    await session.save();

    const response = NextResponse.json({ verified: true });
    response.cookies.set('bytescare_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('Verify OTP error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
