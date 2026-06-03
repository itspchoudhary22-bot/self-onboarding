import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { sendPaymentEnabled } from '@/lib/email';

const PANDADOC_API_KEY = process.env.PANDADOC_API_KEY;

async function getDocumentStatus(documentId) {
  const res = await fetch(`https://api.pandadoc.com/public/v1/documents/${documentId}`, {
    headers: { Authorization: `API-Key ${PANDADOC_API_KEY}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.status; // e.g. 'document.completed', 'document.sent', etc.
}

// POST /api/pandadoc/sync-status
// Body: { applicationId } OR { sessionId } OR { email }
// Checks each agreement's PandaDoc document status and syncs signed state.
export async function POST(request) {
  try {
    const body = await request.json();
    const { applicationId, sessionId, email } = body;

    if (!applicationId && !sessionId && !email) {
      return NextResponse.json({ error: 'applicationId, sessionId, or email required' }, { status: 400 });
    }

    await connectDB();

    let application;
    if (applicationId) {
      application = await Application.findById(applicationId);
    } else if (sessionId) {
      application = await Application.findOne({ sessionId });
    } else {
      application = await Application.findOne({ email: email.toLowerCase().trim() });
    }

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (!application.agreements?.length) {
      return NextResponse.json({ status: application.status, changed: false });
    }

    let changed = false;

    for (const agreement of application.agreements) {
      if (agreement.signed || agreement.agreementType === 'signed') continue;
      if (!agreement.pandadocDocumentId) continue;

      const docStatus = await getDocumentStatus(agreement.pandadocDocumentId);
      if (docStatus === 'document.completed') {
        agreement.signed = true;
        agreement.signedAt = new Date();
        changed = true;
      }
    }

    if (!changed) {
      return NextResponse.json({ status: application.status, changed: false });
    }

    application.markModified('agreements');

    const allSigned = application.agreements.every(
      (a) => a.agreementType === 'signed' || a.signed === true
    );

    if (allSigned && application.status === 'agreement_pending') {
      const nextStatus = application.paymentDetails?.method === 'offline' ? 'ops_setup' : 'payment_pending';
      application.status = nextStatus;
      await application.save();
      if (nextStatus === 'payment_pending') {
        setTimeout(() => {
          try { sendPaymentEnabled(application).catch((e) => console.error('Payment email error:', e)); } catch (e) { console.error('Payment email init:', e); }
        }, 0);
      }
    } else {
      await application.save();
    }

    return NextResponse.json({ status: application.status, changed: true });
  } catch (err) {
    console.error('Sync status error:', err);
    return NextResponse.json({ error: 'Failed to sync status' }, { status: 500 });
  }
}
