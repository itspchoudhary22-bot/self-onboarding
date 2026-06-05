import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import cfg from '@/lib/config';
import { sendOpsRequirements } from '@/lib/email';

async function verifyAuth() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('sales_token');
  if (!tokenCookie?.value) throw new Error('No token');
  const secret = new TextEncoder().encode(cfg.salesJwtSecret);
  await jwtVerify(tokenCookie.value, secret);
  return true;
}

export async function POST(request, { params }) {
  try {
    await verifyAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const { referenceNumber, paymentDate, paymentMode, notes } = await request.json();

    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.paymentDetails?.method !== 'offline') {
      return NextResponse.json({ error: 'Not an offline payment application' }, { status: 400 });
    }

    application.paymentDetails.offlineConfirmation = {
      referenceNumber: referenceNumber || '',
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMode: paymentMode || '',
      notes: notes || '',
      confirmedAt: new Date(),
    };
    application.paymentDetails.paidAt = new Date();
    application.markModified('paymentDetails');
    await application.save();

    sendOpsRequirements(application).catch((e) => console.error('Ops requirements email error:', e));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Confirm offline payment error:', error);
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 });
  }
}
