import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import cfg from '@/lib/config';

async function verifyAuth() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('sales_token');
  if (!tokenCookie?.value) throw new Error('No token');
  const secret = new TextEncoder().encode(cfg.salesJwtSecret);
  await jwtVerify(tokenCookie.value, secret);
  return true;
}

export async function GET(request, { params }) {
  try {
    await verifyAuth(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const { id } = await params;

    // Exclude base64 file fields
    const application = await Application.findById(id)
      .select('-idProofBase64 -regCertBase64 -copyrightCertBase64')
      .lean();

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Sales application detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}
