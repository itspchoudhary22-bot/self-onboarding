import { NextResponse } from 'next/server';
import { sendSalesQuestion } from '@/lib/email';

export async function POST(request) {
  try {
    const formData = await request.json();
    if (!formData.email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    await sendSalesQuestion(formData);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact sales error:', err);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
