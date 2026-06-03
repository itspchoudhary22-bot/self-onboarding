import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import Draft from '@/models/Draft';
import Counter from '@/models/Counter';
// sendSubmissionConfirmation is the new name for sendClientConfirmation
import { sendSubmissionConfirmation, sendSalesNewApplication } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, type, country, services, sessionId } = body;

    if (!email || !type || !country || !services || services.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    // Generate applicationId: BC-{YYYY}-{padded 4 digits}
    const counterValue = await Counter.nextValue('application_counter');
    const year = new Date().getFullYear();
    const applicationId = `BC-${year}-${String(counterValue).padStart(4, '0')}`;

    const application = await Application.create({
      ...body,
      applicationId,
      sessionId: sessionId || '',
      status: 'pending_review',
    });

    // Mark draft as submitted
    if (sessionId) {
      await Draft.findOneAndUpdate({ sessionId }, { status: 'submitted' });
    }

    // Fire emails in background (don't block response)
    // sendSubmissionConfirmation is the updated name (previously sendClientConfirmation)
    Promise.all([
      sendSubmissionConfirmation(body),
      sendSalesNewApplication(application),
    ]).catch((err) => console.error('Email send error:', err));

    return NextResponse.json(
      {
        message: 'Application submitted successfully',
        id: application._id,
        applicationId: application.applicationId,
        sessionId: application.sessionId,
      },
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
