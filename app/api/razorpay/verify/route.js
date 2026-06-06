import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import cfg from '@/lib/config';
import { sendPaymentReceivedNotification, sendOpsRequirements } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    // Accept both camelCase (frontend) and snake_case (Razorpay webhook)
    const razorpayOrderId = body.razorpayOrderId || body.razorpay_order_id;
    const razorpayPaymentId = body.razorpayPaymentId || body.razorpay_payment_id;
    const razorpaySignature = body.razorpaySignature || body.razorpay_signature;
    const { sessionId } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify signature: HMAC-SHA256 of `${orderId}|${paymentId}` using key secret
    const expectedSignature = crypto
      .createHmac('sha256', cfg.razorpayKeySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    await connectDB();

    const application = await Application.findOne({ sessionId });
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    application.paymentDetails.razorpayPaymentId = razorpayPaymentId;
    application.paymentDetails.paidAt = new Date();
    application.markModified('paymentDetails');
    application.status = 'ops_setup';

    await application.save();

    sendPaymentReceivedNotification(application).catch((e) => console.error('Payment received email error:', e));
    sendOpsRequirements(application).catch((e) => console.error('Ops requirements email error:', e));

    return NextResponse.json({
      success: true,
      applicationId: application.applicationId,
    });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
