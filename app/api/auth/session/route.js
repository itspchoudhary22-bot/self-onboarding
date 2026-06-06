import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import CustomerSession from '@/models/CustomerSession';
import Application from '@/models/Application';
import Draft from '@/models/Draft';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('bytescare_session')?.value;
    if (!token) {
      return NextResponse.json({ valid: false });
    }

    await connectDB();
    const session = await CustomerSession.findOne({ sessionToken: token });

    if (!session || !session.sessionExpiresAt || new Date() > session.sessionExpiresAt) {
      return NextResponse.json({ valid: false });
    }

    const email = session.email;

    // Check for submitted application
    const application = await Application.findOne({ email }).lean();
    if (application) {
      return NextResponse.json({
        valid: true,
        email,
        hasApplication: true,
        applicationStatus: application.status,
        applicationId: String(application._id),
        sessionId: application.sessionId || '',
        formData: {
          email: application.email,
          type: application.type || 'individual',
          country: application.country || '',
          services: application.services || [],
          individualName: application.individualName || '',
          companyName: application.companyName || '',
          officialEmail: application.officialEmail || '',
          signatoryEmail: application.signatoryEmail || '',
        },
      });
    }

    // Check for in-progress draft
    const draft = await Draft.findOne({ email, status: { $ne: 'submitted' } })
      .sort({ lastActiveAt: -1 })
      .lean();

    if (draft) {
      return NextResponse.json({
        valid: true,
        email,
        hasApplication: false,
        hasDraft: true,
        sessionId: draft.sessionId || '',
        step: draft.step || 1,
        formData: draft.formData || {},
      });
    }

    // Authenticated but no data yet
    return NextResponse.json({
      valid: true,
      email,
      hasApplication: false,
      hasDraft: false,
    });
  } catch (err) {
    console.error('Session check error:', err);
    return NextResponse.json({ valid: false });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get('bytescare_session')?.value;
  if (token) {
    try {
      await connectDB();
      await CustomerSession.updateOne({ sessionToken: token }, { $unset: { sessionToken: 1, sessionExpiresAt: 1 } });
    } catch {}
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set('bytescare_session', '', { maxAge: 0, path: '/' });
  return response;
}
