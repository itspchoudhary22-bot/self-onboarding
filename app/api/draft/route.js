import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Draft from '@/models/Draft';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });

  await connectDB();
  const draft = await Draft.findOne({ sessionId });
  if (!draft) return NextResponse.json({ draft: null });
  return NextResponse.json({ draft });
}

export async function POST(request) {
  try {
    const { sessionId, step, formData } = await request.json();
    if (!sessionId || !formData) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    await connectDB();
    await Draft.findOneAndUpdate(
      { sessionId },
      {
        sessionId,
        step: step || 1,
        email: formData.email || '',
        formData,
        lastActiveAt: new Date(),
        status: 'draft',
      },
      { upsert: true, new: true }
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Draft save error:', err);
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
}
