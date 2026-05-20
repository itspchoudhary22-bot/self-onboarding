import { NextResponse } from 'next/server';

const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME;
const S3_REGION = process.env.AWS_S3_REGION || 'us-east-1';
const S3_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const S3_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

export async function POST(request) {
  try {
    const { base64, fileName } = await request.json();

    // S3 not configured — silently treat as uploaded with no URL
    if (!S3_BUCKET || !S3_ACCESS_KEY || !S3_SECRET_KEY) {
      return NextResponse.json({ url: '' });
    }

    // S3 upload — wire this in when credentials are ready
    // const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    // const s3 = new S3Client({ region: S3_REGION, credentials: { accessKeyId: S3_ACCESS_KEY, secretAccessKey: S3_SECRET_KEY } });
    // const [, contentType, data] = base64.match(/^data:([^;]+);base64,(.+)$/) || [];
    // const buffer = Buffer.from(data, 'base64');
    // const key = `uploads/${Date.now()}-${fileName}`;
    // await s3.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: buffer, ContentType: contentType }));
    // const url = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
    // return NextResponse.json({ url });

    return NextResponse.json({ url: '' });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ url: '' });
  }
}
