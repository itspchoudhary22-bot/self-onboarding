import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';
import cfg from '@/lib/config';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://self-onboarding-rosy.vercel.app';

export async function POST(request) {
  try {
    const body = await request.json();
    const { applicationId, fileBase64, fileName, label } = body;

    if (!applicationId || !fileBase64 || !fileName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeType = ext === 'docx'
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/pdf';

    // Save file directly to the agreement entry in MongoDB
    if (!application.agreements) application.agreements = [];
    const agreementIdx = application.agreements.length;
    application.agreements.push({
      agreementType: 'unsigned',
      label: label || fileName,
      uploadedFileName: fileName,
      fileMimeType: mimeType,
      fileBase64: fileBase64.replace(/^data:.+;base64,/, ''),
      pandadocSigningUrl: '',
      pandadocDocumentId: '',
      sentToCustomerAt: new Date(),
    });
    application.markModified('agreements');
    application.status = 'agreement_pending';

    // Try PandaDoc for inline signing — fall back gracefully if subscription inactive
    if (cfg.pandadocApiKey) {
      try {
        const displayName = application.type === 'company' ? application.companyName : application.individualName;
        const recipientEmail = application.type === 'company'
          ? application.signatoryEmail || application.email
          : application.officialEmail || application.email;

        const fileBuffer = Buffer.from(fileBase64.replace(/^data:.+;base64,/, ''), 'base64');
        const formData = new FormData();
        formData.append('file', new Blob([fileBuffer], { type: mimeType }), fileName);
        formData.append('data', JSON.stringify({
          name: `Agreement - ${fileName}`,
          recipients: [{ email: recipientEmail, first_name: displayName, last_name: '', role: 'Client' }],
          fields: {},
        }));

        const uploadRes = await fetch('https://api.pandadoc.com/public/v1/documents', {
          method: 'POST',
          headers: { Authorization: `API-Key ${cfg.pandadocApiKey}` },
          body: formData,
        });
        const doc = await uploadRes.json();

        if (uploadRes.ok) {
          await new Promise((r) => setTimeout(r, 3000));
          await fetch(`https://api.pandadoc.com/public/v1/documents/${doc.id}/send`, {
            method: 'POST',
            headers: { Authorization: `API-Key ${cfg.pandadocApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ silent: true, message: 'Please review and sign your agreement.' }),
          });
          const sessionRes = await fetch(`https://api.pandadoc.com/public/v1/documents/${doc.id}/session`, {
            method: 'POST',
            headers: { Authorization: `API-Key ${cfg.pandadocApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipient: recipientEmail, lifetime: 86400 }),
          });
          const sessionData = await sessionRes.json();
          if (sessionData?.id) {
            application.agreements[agreementIdx].pandadocSigningUrl = `https://app.pandadoc.com/s/${sessionData.id}`;
            application.agreements[agreementIdx].pandadocDocumentId = doc.id;
            application.markModified('agreements');
          }
        } else {
          console.warn('PandaDoc upload skipped (subscription or API issue):', doc?.detail?.message || doc?.message);
        }
      } catch (e) {
        console.warn('PandaDoc signing session skipped:', e.message);
      }
    }

    await application.save();

    const downloadUrl = `${APP_URL}/api/agreements/file/${applicationId}/${agreementIdx}`;
    const signingUrl = application.agreements[agreementIdx].pandadocSigningUrl || '';

    return NextResponse.json({ success: true, agreementSaved: true, agreementIdx, signingUrl, downloadUrl });
  } catch (error) {
    console.error('Upload-for-signing error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process upload' }, { status: 500 });
  }
}
