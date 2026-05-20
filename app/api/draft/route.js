import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import connectDB from '@/lib/mongodb';
import Draft from '@/models/Draft';
import { sendResumeLink } from '@/lib/email';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  if (!sessionId) return NextResponse.json({ draft: null });

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

    const existing = await Draft.findOne({ sessionId });
    const isFirstSaveWithEmail = !existing?.email && formData.email;

    // Generate resume token on first save with a valid email
    const resumeToken = isFirstSaveWithEmail
      ? randomBytes(24).toString('hex')
      : existing?.resumeToken;

    await Draft.findOneAndUpdate(
      { sessionId },
      {
        sessionId,
        step: step || 1,
        email: formData.email || '',
        formData,
        lastActiveAt: new Date(),
        status: 'draft',
        ...(resumeToken && { resumeToken }),
      },
      { upsert: true, new: true }
    );

    // Send resume link email on first save (fire and forget)
    if (isFirstSaveWithEmail && resumeToken) {
      sendResumeLink(formData.email, resumeToken).catch(() => {});
    }

    return NextResponse.json({ ok: true, resumeToken: resumeToken || null });
  } catch (err) {
    console.error('Draft save error:', err);
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
}
