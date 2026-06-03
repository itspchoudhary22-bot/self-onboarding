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
    await verifyAuth(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const { id } = await params;

    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check agreement exists
    if (!application.agreementDetails) {
      return NextResponse.json(
        { error: 'Complete agreement, payment, and ops requirements first' },
        { status: 400 }
      );
    }

    // Check payment: paymentDetails must exist (covers both portal and offline)
    const hasPayment = application.paymentDetails != null;
    if (!hasPayment) {
      return NextResponse.json(
        { error: 'Complete agreement, payment, and ops requirements first' },
        { status: 400 }
      );
    }

    // Check operationalRequirements exists
    if (!application.operationalRequirements) {
      return NextResponse.json(
        { error: 'Complete agreement, payment, and ops requirements first' },
        { status: 400 }
      );
    }

    application.operationalRequirements.sentToOpsAt = new Date();
    application.status = 'ops_setup';

    await application.save();

    // Fire ops requirements email in background
    sendOpsRequirements(application).catch((err) =>
      console.error('sendOpsRequirements email error:', err)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send to ops error:', error);
    return NextResponse.json({ error: 'Failed to send to ops' }, { status: 500 });
  }
}
