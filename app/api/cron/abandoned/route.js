import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Draft from '@/models/Draft';
import { sendAbandonedSessionAlert } from '@/lib/email';

export async function GET(request) {
  // Protect cron endpoint with a secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const abandoned = await Draft.find({
    status: 'draft',
    lastActiveAt: { $lt: cutoff },
    email: { $ne: '' },
  }).limit(50);

  const results = await Promise.allSettled(
    abandoned.map((draft) => sendAbandonedSessionAlert(draft))
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  return NextResponse.json({ processed: abandoned.length, sent, failed });
}
