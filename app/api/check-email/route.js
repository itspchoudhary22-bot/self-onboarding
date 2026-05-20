import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email')?.toLowerCase().trim();
  if (!email) return NextResponse.json({ exists: false });

  await connectDB();
  const existing = await Application.findOne({ email }).select('_id').lean();
  return NextResponse.json({ exists: !!existing });
}
