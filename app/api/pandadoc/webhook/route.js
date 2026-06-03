import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { sendPaymentEnabled } from '@/lib/email';

export async function POST(request) {
  try {
    const events = await request.json();
    const eventList = Array.isArray(events) ? events : [events];

    await connectDB();

    for (const event of eventList) {
      if (event.event !== 'document_state_changed') continue;
      const { id: documentId, status } = event.data || {};
      if (!documentId || status !== 'document.completed') continue;

      // Find application that has this pandadocDocumentId in its agreements array
      const application = await Application.findOne({
        'agreements.pandadocDocumentId': documentId,
      });
      if (!application) continue;

      // Mark the matching agreement as signed
      let changed = false;
      (application.agreements || []).forEach((a) => {
        if (a.pandadocDocumentId === documentId && !a.signed) {
          a.signed = true;
          a.signedAt = new Date();
          changed = true;
        }
      });

      if (!changed) continue;

      application.markModified('agreements');

      // Check if all agreements that require signing are now signed
      // agreementType 'signed' = pre-signed by sales, counts as done
      const allSigned = application.agreements.every(
        (a) => a.agreementType === 'signed' || a.signed === true
      );

      if (allSigned && application.status === 'agreement_pending') {
        application.status = 'payment_pending';
        await application.save();

        // Notify customer that payment step is ready
        setTimeout(() => {
          try { sendPaymentEnabled(application).catch((e) => console.error('Payment email error:', e)); } catch (e) { console.error('Payment email init:', e); }
        }, 0);
      } else {
        await application.save();
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
