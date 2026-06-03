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

    // Recalculate status only if agreements are already all done
    const allSigned = application.agreements?.length > 0 &&
      application.agreements.every((a) => a.agreementType === 'signed' || a.signed === true);
    if (allSigned) {
      application.status = method === 'offline' ? 'ops_setup' : 'payment_pending';
    }
    // If agreements not done yet, status stays at agreement_pending until customer signs

    await application.save();

    // Notify customer only when online payment is now ready
    if (method === 'portal' && allSigned) {
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
