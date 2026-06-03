import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import cfg from '@/lib/config';
import { sendPaymentEnabled } from '@/lib/email';

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
    await verifyAuth(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { planName, currency, amount, frequency, serviceDuration, startDate, endDate, method } = body;

    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    application.paymentDetails = {
      planName: planName || '',
      currency: currency || 'INR',
      amount: amount || 0,
      frequency: frequency || 'monthly',
      serviceDuration: serviceDuration || '1year',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      method: method || 'portal',
      enabledAt: new Date(),
    };

    // Both portal and offline go to payment_pending — sales decides
    application.status = 'payment_pending';

    await application.save();

    // Fire payment enabled email if method is portal
    if (method === 'portal') {
      sendPaymentEnabled(application).catch((err) =>
        console.error('sendPaymentEnabled email error:', err)
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sales payment update error:', error);
    return NextResponse.json({ error: 'Failed to update payment details' }, { status: 500 });
  }
}
