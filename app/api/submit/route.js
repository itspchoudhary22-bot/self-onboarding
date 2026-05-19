import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, type, name, phone, services } = body;

    if (!email || !type || !name || !services || services.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const application = await Application.create({
      email,
      type,
      name,
      phone: phone || '',
      services,
    });

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
