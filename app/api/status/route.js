import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import Draft from '@/models/Draft';
import cfg from '@/lib/config';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const email = searchParams.get('email');

    if (!sessionId && !email) {
      return NextResponse.json({ error: 'sessionId or email is required' }, { status: 400 });
    }

    await connectDB();

    let application, resumeToken = null;

    if (email) {
      application = await Application.findOne({ email: email.toLowerCase().trim() }).lean();
    } else {
      const draft = await Draft.findOne({ sessionId }).select('resumeToken').lean();
      resumeToken = draft?.resumeToken || null;
      application = await Application.findOne({ sessionId }).lean();
    }

    if (!application) {
      return NextResponse.json({ status: 'not_found', resumeToken });
    }

    const displayName =
      application.type === 'company' ? application.companyName : application.individualName;

    // Build response — exclude base64 fields and sensitive data
    const response = {
      applicationId: application.applicationId,
      status: application.status,
      createdAt: application.createdAt,
      services: application.services,
      displayName,
      resumeToken,
    };

    // Only include agreementDetails (with signingUrl) when status is agreement_pending
    if (application.status === 'agreement_pending' && application.agreementDetails) {
      response.agreementDetails = {
        agreementType: application.agreementDetails.agreementType,
        pandadocSigningUrl: application.agreementDetails.pandadocSigningUrl,
        uploadedFileName: application.agreementDetails.uploadedFileName,
        sentToCustomerAt: application.agreementDetails.sentToCustomerAt,
      };
    }

    // Only include paymentDetails when status is payment_pending
    if (application.status === 'payment_pending' && application.paymentDetails) {
      response.paymentDetails = {
        planName: application.paymentDetails.planName,
        amount: application.paymentDetails.amount,
        currency: application.paymentDetails.currency,
        frequency: application.paymentDetails.frequency,
        razorpayKeyId: cfg.razorpayKeyId,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Status route error:', error);
    return NextResponse.json({ error: 'Failed to fetch application status' }, { status: 500 });
  }
}
