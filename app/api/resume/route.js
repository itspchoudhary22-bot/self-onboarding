import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Draft from '@/models/Draft';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (!token) return NextResponse.json({ draft: null });

  await connectDB();
  const draft = await Draft.findOne({ resumeToken: token, status: 'draft' });
  if (!draft) return NextResponse.json({ draft: null });

  return NextResponse.json({ draft });
}
