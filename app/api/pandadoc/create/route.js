import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Draft from '@/models/Draft';

const PANDADOC_API_KEY = process.env.PANDADOC_API_KEY;
const SERVICE_AGREEMENT_TEMPLATE_ID = process.env.PANDADOC_SERVICE_AGREEMENT_TEMPLATE_ID;
const LOA_TEMPLATE_ID = process.env.PANDADOC_LOA_TEMPLATE_ID;
const CLIENT_ROLE = process.env.PANDADOC_CLIENT_ROLE || 'client';

function buildClientRecipient(formData, roleName) {
  const isCompany = formData.type === 'company';
  const clientEmail = isCompany ? formData.signatoryEmail : formData.officialEmail || formData.email;
  const clientFullName = isCompany ? formData.signatoryName : formData.individualName;
  const [clientFirst, ...rest] = clientFullName.split(' ');
  const clientLast = rest.join(' ') || '-';
  return { email: clientEmail, first_name: clientFirst, last_name: clientLast, role: roleName };
}

// Fetch the role name from the template so we don't have to guess capitalisation
async function resolveClientRole(templateId) {
  try {
    const res = await pandaDocRequest(`https://api.pandadoc.com/public/v1/templates/${templateId}/details`, 'GET');
    if (!res.ok) return CLIENT_ROLE;
    const { roles } = await res.json();
    if (!roles?.length) return CLIENT_ROLE;
    // Prefer an exact env-var match, then a case-insensitive match, then first role
    return (
      roles.find((r) => r.name === CLIENT_ROLE)?.name ||
      roles.find((r) => r.name.toLowerCase() === CLIENT_ROLE.toLowerCase())?.name ||
      roles[0].name
    );
  } catch {
    return CLIENT_ROLE;
  }
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
  throw new Error('PandaDoc rate limit exceeded after retries. Please try again in a moment.');
}

async function createPandaDocDocument(templateId, recipients, tokens, name) {
  const res = await pandaDocRequest('https://api.pandadoc.com/public/v1/documents', 'POST', {
    name,
    template_uuid: templateId,
    recipients,
    tokens,
    fields: {},
    silent: true,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PandaDoc document creation failed: ${err}`);
  }
  return res.json();
}

async function sendDocument(documentId) {
  // Wait until document finishes processing (uploaded → draft)
  for (let i = 0; i < 20; i++) {
    const statusRes = await pandaDocRequest(`https://api.pandadoc.com/public/v1/documents/${documentId}`, 'GET');
    const { status } = await statusRes.json();
    if (status === 'document.draft') break;
    await new Promise((r) => setTimeout(r, 2000));
  }

  const res = await pandaDocRequest(`https://api.pandadoc.com/public/v1/documents/${documentId}/send`, 'POST', {
    silent: true,
    subject: 'Please sign your Bytescare documents',
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to send document: ${err}`);
  }
  return res.json();
}

async function getSigningSession(documentId, recipientEmail) {
  // Poll until document is in 'document.waiting_approval' or 'document.sent'
  for (let i = 0; i < 10; i++) {
    const statusRes = await pandaDocRequest(`https://api.pandadoc.com/public/v1/documents/${documentId}`, 'GET');
    const { status } = await statusRes.json();
    if (status === 'document.waiting_approval' || status === 'document.sent' || status === 'document.viewed') break;
    await new Promise((r) => setTimeout(r, 1500));
  }

  const res = await pandaDocRequest(`https://api.pandadoc.com/public/v1/documents/${documentId}/session`, 'POST', {
    recipient: recipientEmail,
    lifetime: 2592000,
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

    // Resolve actual role names from each template (handles capitalisation mismatches)
    const [saRole, loaRole] = await Promise.all([
      resolveClientRole(SERVICE_AGREEMENT_TEMPLATE_ID),
      resolveClientRole(LOA_TEMPLATE_ID),
    ]);

    const saDoc = await createPandaDocDocument(SERVICE_AGREEMENT_TEMPLATE_ID, [buildClientRecipient(formData, saRole)], tokens, `Service Agreement – ${clientName}`);
    const loaDoc = await createPandaDocDocument(LOA_TEMPLATE_ID, [buildClientRecipient(formData, loaRole)], tokens, `Letter of Authorization – ${clientName}`);

    // Send both documents so they move draft → sent, enabling embedded signing sessions
    await sendDocument(saDoc.id);
    await sendDocument(loaDoc.id);

    // Get signing sessions for both documents
    const saSession = await getSigningSession(saDoc.id, recipientEmail);
    const loaSession = await getSigningSession(loaDoc.id, recipientEmail);

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
      signingUrl: `https://app.pandadoc.com/s/${saSession.id}`,
      loaSigningUrl: `https://app.pandadoc.com/s/${loaSession.id}`,
    });
  } catch (err) {
    console.error('PandaDoc create error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create documents' }, { status: 500 });
  }
}
