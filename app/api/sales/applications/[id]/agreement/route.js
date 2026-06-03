import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import cfg from '@/lib/config';
import { sendAgreementReady } from '@/lib/email';

async function verifyAuth() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('sales_token');
  if (!tokenCookie?.value) throw new Error('No token');
  const secret = new TextEncoder().encode(cfg.salesJwtSecret);
  await jwtVerify(tokenCookie.value, secret);
  return true;
}

export async function DELETE(request, { params }) {
  try {
    await verifyAuth();
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
    application.agreementDetails = null;
    application.status = 'pending_review';
    await application.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Agreement reset error:', error);
    return NextResponse.json({ error: 'Failed to reset agreement' }, { status: 500 });
  }
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
    const body = await request.json();
    const { agreementType, pandadocDocumentId, pandadocSigningUrl, uploadedFileName } = body;

    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    application.agreementDetails = {
      agreementType,
      pandadocDocumentId: pandadocDocumentId || '',
      pandadocSigningUrl: pandadocSigningUrl || '',
      uploadedFileName: uploadedFileName || '',
      sentToCustomerAt: new Date(),
    };

    if (agreementType === 'signed') {
      application.status = 'payment_pending';
    } else {
      application.status = 'agreement_pending';
    }

    await application.save();

    // Notify customer by email
    if (agreementType !== 'signed') {
      setTimeout(() => {
        try { sendAgreementReady(application).catch((e) => console.error('Agreement email error:', e)); } catch (e) { console.error('Agreement email init:', e); }
      }, 0);
    }

    return NextResponse.json({ success: true, status: application.status });
  } catch (error) {
    console.error('Sales agreement update error:', error);
    return NextResponse.json({ error: 'Failed to update agreement details' }, { status: 500 });
  }
}
