import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import Draft from '@/models/Draft';
import { sendClientConfirmation, sendOpsNotification } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, type, country, services, sessionId, pandadocDocumentId } = body;

    if (!email || !type || !country || !services || services.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const application = await Application.create({
      ...body,
      sessionId: sessionId || '',
      pandadocDocumentId: pandadocDocumentId || '',
      pandadocStatus: pandadocDocumentId ? 'completed' : 'pending',
    });

    // Mark draft as submitted
    if (sessionId) {
      await Draft.findOneAndUpdate({ sessionId }, { status: 'submitted' });
    }

    // Fire emails in background (don't block response)
    Promise.all([
      sendClientConfirmation(body),
      sendOpsNotification(body),
    ]).catch((err) => console.error('Email send error:', err));

    return NextResponse.json(
      { message: 'Application submitted successfully', id: application._id },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'An application with this email already exists.' },
        { status: 409 }
      );
    }
    console.error('Submit error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}
