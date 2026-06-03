import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import cfg from '@/lib/config';

export async function POST(request) {
  try {
    if (!cfg.razorpayKeyId || !cfg.razorpayKeySecret) {
      return NextResponse.json(
        { error: 'Payment not configured', notConfigured: true },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    await connectDB();

    const application = await Application.findOne({ sessionId });
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (!application.paymentDetails || !application.paymentDetails.amount) {
      return NextResponse.json({ error: 'Payment details not configured for this application' }, { status: 400 });
    }

    const displayName =
      application.type === 'company' ? application.companyName : application.individualName;

    // Amount in smallest currency unit (paise for INR)
    const amountInPaise = Math.round(application.paymentDetails.amount * 100);

    const auth = Buffer.from(`${cfg.razorpayKeyId}:${cfg.razorpayKeySecret}`).toString('base64');
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: application.paymentDetails.currency || 'INR',
        receipt: application.applicationId,
      }),
    });

    const order = await res.json();

    if (!res.ok) {
      console.error('Razorpay order creation failed:', order);
      return NextResponse.json({ error: 'Failed to create payment order' }, { status: 502 });
    }

    // Store the order ID on the application
    application.paymentDetails.razorpayOrderId = order.id;
    await application.save();

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: cfg.razorpayKeyId,
      applicationId: application.applicationId,
      displayName,
    });
  } catch (error) {
    console.error('Razorpay create-order error:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
