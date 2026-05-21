import { NextResponse } from 'next/server';

const PANDADOC_API_KEY = process.env.PANDADOC_API_KEY;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');
  if (!documentId) return NextResponse.json({ error: 'Missing documentId' }, { status: 400 });

  if (!PANDADOC_API_KEY) {
    return NextResponse.json({ status: 'not_configured' });
  }

  try {
    const res = await fetch(`https://api.pandadoc.com/public/v1/documents/${documentId}`, {
      headers: { Authorization: `API-Key ${PANDADOC_API_KEY}` },
    });
    if (!res.ok) return NextResponse.json({ status: 'error' });
    const doc = await res.json();
    return NextResponse.json({ status: doc.status, recipients: doc.recipients ?? [] });
  } catch {
    return NextResponse.json({ status: 'error' });
  }
}
