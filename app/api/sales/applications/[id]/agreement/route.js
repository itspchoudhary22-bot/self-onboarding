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

// Add a new agreement document to the array
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
    const { agreementType, pandadocDocumentId, pandadocSigningUrl, uploadedFileName, label } = body;

    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const newAgreement = {
      agreementType,
      label: label || '',
      pandadocDocumentId: pandadocDocumentId || '',
      pandadocSigningUrl: pandadocSigningUrl || '',
      uploadedFileName: uploadedFileName || '',
      sentToCustomerAt: new Date(),
    };

    if (!application.agreements) application.agreements = [];
    application.agreements.push(newAgreement);
    application.markModified('agreements');

    // Status: payment_pending only if this is a pre-signed doc and it's the first/only one
    if (agreementType === 'signed' && application.agreements.length === 1) {
      application.status = 'payment_pending';
    } else {
      application.status = 'agreement_pending';
    }

    await application.save();

    if (agreementType !== 'signed') {
      setTimeout(() => {
        try { sendAgreementReady(application).catch((e) => console.error('Agreement email error:', e)); } catch (e) { console.error('Agreement email init:', e); }
      }, 0);
    }

    return NextResponse.json({ success: true, status: application.status, agreements: application.agreements });
  } catch (error) {
    console.error('Sales agreement update error:', error);
    return NextResponse.json({ error: 'Failed to update agreement details' }, { status: 500 });
  }
}

// Remove a single agreement by index, or reset all if no index given
export async function DELETE(request, { params }) {
  try {
    await verifyAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const indexParam = searchParams.get('index');

    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (indexParam !== null) {
      const idx = parseInt(indexParam);
      if (!isNaN(idx) && application.agreements?.[idx]) {
        application.agreements.splice(idx, 1);
        application.markModified('agreements');
      }
    } else {
      application.agreements = [];
    }

    if (!application.agreements?.length) {
      application.status = 'pending_review';
    }

    await application.save();
    return NextResponse.json({ success: true, agreements: application.agreements });
  } catch (error) {
    console.error('Agreement reset error:', error);
    return NextResponse.json({ error: 'Failed to reset agreement' }, { status: 500 });
  }
}
