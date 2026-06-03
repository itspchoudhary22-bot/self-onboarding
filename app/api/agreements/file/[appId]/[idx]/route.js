import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Application from '@/models/Application';

export async function GET(request, { params }) {
  try {
    const { appId, idx } = await params;
    await connectDB();

    const application = await Application.findById(appId).lean();
    if (!application) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const agreement = application.agreements?.[parseInt(idx)];
    if (!agreement?.fileBase64) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const buffer = Buffer.from(agreement.fileBase64, 'base64');
    const mimeType = agreement.fileMimeType || 'application/octet-stream';
    const fileName = agreement.uploadedFileName || 'document';

    return new Response(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('File download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
