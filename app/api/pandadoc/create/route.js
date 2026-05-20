import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Draft from '@/models/Draft';

const PANDADOC_API_KEY = process.env.PANDADOC_API_KEY;
const SERVICE_AGREEMENT_TEMPLATE_ID = process.env.PANDADOC_SERVICE_AGREEMENT_TEMPLATE_ID;
const LOA_TEMPLATE_ID = process.env.PANDADOC_LOA_TEMPLATE_ID;
const CLIENT_ROLE = process.env.PANDADOC_CLIENT_ROLE || 'client';
const SIGNER_ROLE = process.env.PANDADOC_SIGNER_ROLE || 'signer';
const SIGNER_EMAIL = process.env.PANDADOC_SIGNER_EMAIL || process.env.OPS_EMAIL;
const SIGNER_FIRST = process.env.PANDADOC_SIGNER_FIRST_NAME || 'Bytescare';
const SIGNER_LAST = process.env.PANDADOC_SIGNER_LAST_NAME || 'Team';

function buildClientRecipient(formData) {
  const isCompany = formData.type === 'company';
  const clientEmail = isCompany ? formData.signatoryEmail : formData.officialEmail || formData.email;
  const clientFullName = isCompany ? formData.signatoryName : formData.individualName;
  const [clientFirst, ...rest] = clientFullName.split(' ');
  const clientLast = rest.join(' ') || '-';
  return { email: clientEmail, first_name: clientFirst, last_name: clientLast, role: CLIENT_ROLE };
}

function buildSignerRecipient() {
  if (!SIGNER_EMAIL) return null;
  return { email: SIGNER_EMAIL, first_name: SIGNER_FIRST, last_name: SIGNER_LAST, role: SIGNER_ROLE };
}

// SA has both Client + Sender roles; LOA has only Sender role
function buildRecipientsForSA(formData) {
  const recipients = [buildClientRecipient(formData)];
  const signer = buildSignerRecipient();
  if (signer) recipients.push(signer);
  return recipients;
}

function buildRecipientsForLOA() {
  const signer = buildSignerRecipient();
  return signer ? [signer] : [];
}

function buildTokens(formData) {
  const isCompany = formData.type === 'company';
  return [
    { name: 'Client.Name', value: isCompany ? formData.companyName : formData.individualName },
    { name: 'Client.Email', value: isCompany ? formData.signatoryEmail : formData.officialEmail },
    { name: 'Client.Type', value: formData.type },
    { name: 'Client.Country', value: formData.country },
    { name: 'Client.Address', value: isCompany ? formData.companyRegisteredAddress : formData.registeredAddress },
    { name: 'Client.Services', value: formData.services.join(', ') },
    { name: 'Signatory.Name', value: isCompany ? formData.signatoryName : formData.individualName },
    { name: 'Signatory.Designation', value: isCompany ? formData.signatoryDesignation : formData.designation },
  ];
}

async function createPandaDocDocument(templateId, recipients, tokens, name) {
  const body = {
    name,
    template_uuid: templateId,
    recipients,
    tokens,
    fields: {},
    silent: true,
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch('https://api.pandadoc.com/public/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `API-Key ${PANDADOC_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (res.status === 429) {
      const text = await res.text();
      const match = text.match(/(\d+)\s*second/);
      const wait = match ? parseInt(match[1]) * 1000 : 5000;
      await new Promise((r) => setTimeout(r, wait + 500));
      continue;
    }

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`PandaDoc document creation failed: ${err}`);
    }
    return res.json();
  }

  throw new Error('PandaDoc rate limit exceeded after retries. Please try again in a moment.');
}

async function getSigningSession(documentId, recipientEmail) {
  // Wait briefly for document to be ready
  await new Promise((r) => setTimeout(r, 3000));

  const res = await fetch(`https://api.pandadoc.com/public/v1/documents/${documentId}/session`, {
    method: 'POST',
    headers: {
      Authorization: `API-Key ${PANDADOC_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      signer: recipientEmail,
      lifetime: 3600,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create signing session: ${err}`);
  }
  return res.json();
}

export async function POST(request) {
  try {
    const { sessionId, formData } = await request.json();

    if (!PANDADOC_API_KEY) {
      return NextResponse.json(
        { error: 'PANDADOC_API_KEY not configured', notConfigured: true },
        { status: 503 }
      );
    }
    if (!SERVICE_AGREEMENT_TEMPLATE_ID || !LOA_TEMPLATE_ID) {
      return NextResponse.json(
        { error: 'PandaDoc template IDs not configured', notConfigured: true },
        { status: 503 }
      );
    }

    const isCompany = formData.type === 'company';
    const clientName = isCompany ? formData.companyName : formData.individualName;
    const recipientEmail = isCompany ? formData.signatoryEmail : formData.officialEmail || formData.email;

    const tokens = buildTokens(formData);
    const saDoc = await createPandaDocDocument(SERVICE_AGREEMENT_TEMPLATE_ID, buildRecipientsForSA(formData), tokens, `Service Agreement – ${clientName}`);
    const loaDoc = await createPandaDocDocument(LOA_TEMPLATE_ID, buildRecipientsForLOA(), tokens, `Letter of Authorization – ${clientName}`);

    // Get signing session for the service agreement (primary document)
    const session = await getSigningSession(saDoc.id, recipientEmail);

    await connectDB();
    await Draft.findOneAndUpdate(
      { sessionId },
      {
        pandadocDocumentId: saDoc.id,
        status: 'signing',
        lastActiveAt: new Date(),
      }
    );

    return NextResponse.json({
      documentId: saDoc.id,
      loaDocumentId: loaDoc.id,
      signingUrl: `https://app.pandadoc.com/s/${session.id}`,
      downloadUrl: `https://api.pandadoc.com/public/v1/documents/${saDoc.id}/download`,
    });
  } catch (err) {
    console.error('PandaDoc create error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create documents' }, { status: 500 });
  }
}
