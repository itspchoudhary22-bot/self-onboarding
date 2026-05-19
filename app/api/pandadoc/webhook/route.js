import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Draft from '@/models/Draft';
import Application from '@/models/Application';

export async function POST(request) {
  try {
    const events = await request.json();
    const eventList = Array.isArray(events) ? events : [events];

    await connectDB();

    for (const event of eventList) {
      if (event.event !== 'document_state_changed') continue;
      const { id: documentId, status } = event.data || {};
      if (!documentId) continue;

      if (status === 'document.completed') {
        const draft = await Draft.findOne({ pandadocDocumentId: documentId });
        if (!draft || draft.status === 'submitted') continue;

        try {
          await Application.create({
            ...draft.formData,
            sessionId: draft.sessionId,
            pandadocDocumentId: documentId,
            pandadocStatus: 'completed',
          });
          await Draft.findByIdAndUpdate(draft._id, { status: 'submitted' });
        } catch (err) {
          if (err.code !== 11000) console.error('Webhook submit error:', err);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
