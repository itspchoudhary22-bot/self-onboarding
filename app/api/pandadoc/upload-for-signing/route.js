import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import cfg from '@/lib/config';

export async function POST(request) {
  try {
    if (!cfg.pandadocApiKey) {
      return NextResponse.json({ notConfigured: true }, { status: 503 });
    }

    const body = await request.json();
    const { applicationId, fileBase64, fileName } = body;

    if (!applicationId || !fileBase64 || !fileName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    // applicationId here is the MongoDB _id
    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const displayName =
      application.type === 'company' ? application.companyName : application.individualName;
    const recipientEmail =
      application.type === 'company'
        ? application.signatoryEmail || application.email
        : application.officialEmail || application.email;

    // Convert base64 to buffer
    const base64Data = fileBase64.replace(/^data:.+;base64,/, '');
    const fileBuffer = Buffer.from(base64Data, 'base64');

    // Create FormData and upload PDF to PandaDoc
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer], { type: 'application/pdf' }), fileName);
    formData.append(
      'data',
      JSON.stringify({
        name: `Agreement - ${fileName}`,
        recipients: [
          {
            email: recipientEmail,
            first_name: displayName,
            last_name: '',
            role: 'Client',
          },
        ],
        fields: {},
      })
    );

    const uploadRes = await fetch('https://api.pandadoc.com/public/v1/documents', {
      method: 'POST',
      headers: { Authorization: `API-Key ${cfg.pandadocApiKey}` },
      body: formData,
    });

    const doc = await uploadRes.json();

    if (!uploadRes.ok) {
      console.error('PandaDoc upload failed:', doc);
      return NextResponse.json({ error: 'Failed to upload document to PandaDoc' }, { status: 502 });
    }

    // Wait for document to process
    await new Promise((r) => setTimeout(r, 3000));

    // Send document so it moves to a signable state
    await fetch(`https://api.pandadoc.com/public/v1/documents/${doc.id}/send`, {
      method: 'POST',
      headers: {
        Authorization: `API-Key ${cfg.pandadocApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ silent: true, message: 'Please review and sign your agreement.' }),
    });

    // Get signing session for the recipient
    const sessionRes = await fetch(`https://api.pandadoc.com/public/v1/documents/${doc.id}/session`, {
      method: 'POST',
      headers: {
        Authorization: `API-Key ${cfg.pandadocApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipient: recipientEmail, lifetime: 86400 }),
    });

    const sessionData = await sessionRes.json();
    const signingUrl = `https://app.pandadoc.com/s/${sessionData.id}`;

    return NextResponse.json({
      success: true,
      documentId: doc.id,
      signingUrl,
    });
  } catch (error) {
    console.error('PandaDoc upload-for-signing error:', error);
    return NextResponse.json({ error: 'Failed to upload document for signing' }, { status: 500 });
  }
}
