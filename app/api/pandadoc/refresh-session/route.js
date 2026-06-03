import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import cfg from '@/lib/config';

const PANDADOC_API_KEY = process.env.PANDADOC_API_KEY;

async function verifyAuth() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('sales_token');
  if (!tokenCookie?.value) throw new Error('No token');
  const secret = new TextEncoder().encode(cfg.salesJwtSecret);
  await jwtVerify(tokenCookie.value, secret);
}

async function pandaDocRequest(url, method, body) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `API-Key ${PANDADOC_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 429) {
      const text = await res.text();
      const match = text.match(/(\d+)\s*second/);
      const wait = match ? parseInt(match[1]) * 1000 : 5000;
      await new Promise((r) => setTimeout(r, wait + 500));
      continue;
    }
    return res;
  }
  throw new Error('PandaDoc rate limit exceeded after retries.');
}

// POST /api/pandadoc/refresh-session
// Body: { applicationId, agreementIdx }
// Re-creates a signing session for an existing PandaDoc document and updates the stored URL
export async function POST(request) {
  try { await verifyAuth(); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { applicationId, agreementIdx } = await request.json();

    await connectDB();
    const application = await Application.findById(applicationId);
    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

    const agreement = application.agreements?.[agreementIdx];
    if (!agreement) return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });

    const documentId = agreement.pandadocDocumentId;
    if (!documentId) return NextResponse.json({ error: 'No PandaDoc document ID on this agreement' }, { status: 400 });

    // Determine recipient email
    const isCompany = application.type === 'company';
    const recipientEmail = isCompany
      ? application.signatoryEmail
      : application.officialEmail || application.email;

    if (!recipientEmail) return NextResponse.json({ error: 'No recipient email on application' }, { status: 400 });

    // Create a new signing session (30-day lifetime)
    const sessionRes = await pandaDocRequest(
      `https://api.pandadoc.com/public/v1/documents/${documentId}/session`,
      'POST',
      { recipient: recipientEmail, lifetime: 2592000 }
    );

    if (!sessionRes.ok) {
      const err = await sessionRes.text();
      return NextResponse.json({ error: `PandaDoc session error: ${err}` }, { status: 502 });
    }

    const session = await sessionRes.json();
    const newUrl = `https://app.pandadoc.com/s/${session.id}`;

    application.agreements[agreementIdx].pandadocSigningUrl = newUrl;
    application.markModified('agreements');
    await application.save();

    return NextResponse.json({ success: true, signingUrl: newUrl });
  } catch (err) {
    console.error('Refresh session error:', err);
    return NextResponse.json({ error: err.message || 'Failed to refresh session' }, { status: 500 });
  }
}
