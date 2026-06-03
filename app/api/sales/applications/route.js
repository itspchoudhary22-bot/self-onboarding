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

export async function GET(request) {
  try {
    await verifyAuth(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('applicationId email type status services createdAt companyName individualName country')
        .lean(),
      Application.countDocuments(filter),
    ]);

    const formattedApplications = applications.map((app) => ({
      applicationId: app.applicationId,
      email: app.email,
      type: app.type,
      status: app.status,
      services: app.services,
      servicesCount: (app.services || []).length,
      createdAt: app.createdAt,
      displayName: app.type === 'company' ? app.companyName : app.individualName,
      country: app.country,
      _id: app._id,
    }));

    return NextResponse.json({
      applications: formattedApplications,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Sales applications list error:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
