import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { sendPaymentEnabled } from '@/lib/email';

const PANDADOC_API_KEY = process.env.PANDADOC_API_KEY;

async function getPandaDocStatus(documentId) {
  try {
    const res = await fetch(`https://api.pandadoc.com/public/v1/documents/${documentId}`, {
      headers: { Authorization: `API-Key ${PANDADOC_API_KEY}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.status;
  } catch {
    return null;
  }
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!PANDADOC_API_KEY) {
    return NextResponse.json({ skipped: true, reason: 'No PandaDoc API key' });
  }

  await connectDB();

  // Find all applications awaiting signatures with at least one unsigned PandaDoc agreement
  const applications = await Application.find({
    status: 'agreement_pending',
    'agreements.pandadocDocumentId': { $exists: true, $ne: '' },
  }).limit(100);

  let updated = 0;

  for (const application of applications) {
    let changed = false;

    for (const agreement of application.agreements) {
      if (agreement.signed || agreement.agreementType === 'signed') continue;
      if (!agreement.pandadocDocumentId) continue;

      const docStatus = await getPandaDocStatus(agreement.pandadocDocumentId);
      if (docStatus === 'document.completed') {
        agreement.signed = true;
        agreement.signedAt = new Date();
        changed = true;
      }
    }

    if (!changed) continue;

    application.markModified('agreements');

    const allSigned = application.agreements.every(
      (a) => a.agreementType === 'signed' || a.signed === true
    );

    if (allSigned) {
      application.status = 'payment_pending';
      await application.save();
      updated++;
      setTimeout(() => {
        try { sendPaymentEnabled(application).catch((e) => console.error('Payment email error:', e)); } catch (e) { console.error('Payment email init:', e); }
      }, 0);
    } else {
      await application.save();
    }
  }

  return NextResponse.json({ checked: applications.length, updated });
}
