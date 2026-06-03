import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import { sendPaymentEnabled } from '@/lib/email';

export async function POST(request) {
  try {
    const rawBody = await request.text();

    // Verify PandaDoc webhook signature if key is configured
    const webhookKey = process.env.PANDADOC_WEBHOOK_KEY;
    if (webhookKey) {
      const signature = request.headers.get('x-pandadoc-signature');
      if (!signature) {
        console.error('PandaDoc webhook: missing x-pandadoc-signature header');
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
      }
      const expected = crypto.createHmac('sha256', webhookKey).update(rawBody).digest('hex');
      if (signature !== expected) {
        console.error('PandaDoc webhook: signature mismatch — check PANDADOC_WEBHOOK_KEY in Vercel env vars');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    console.log('PandaDoc webhook received:', rawBody.slice(0, 200));

    const events = JSON.parse(rawBody);
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
