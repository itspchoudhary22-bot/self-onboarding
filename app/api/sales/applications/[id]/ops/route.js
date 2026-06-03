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

export async function POST(request, { params }) {
  try {
    await verifyAuth(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const {
      websites,
      youtubeChannels,
      socialHandles,
      brandNames,
      platforms,
      priority,
      instructions,
      slaStartDate,
    } = body;

    const application = await Application.findById(id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    application.operationalRequirements = {
      websites: websites || '',
      youtubeChannels: youtubeChannels || '',
      socialHandles: socialHandles || '',
      brandNames: brandNames || '',
      platforms: platforms || [],
      priority: priority || 'standard',
      instructions: instructions || '',
      slaStartDate: slaStartDate ? new Date(slaStartDate) : undefined,
    };

    // Save ops requirements — do NOT send to ops yet (that's the send-to-ops route)
    await application.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sales ops update error:', error);
    return NextResponse.json({ error: 'Failed to update operational requirements' }, { status: 500 });
  }
}
