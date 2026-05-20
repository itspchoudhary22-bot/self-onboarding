import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || 'onboarding@bytescare.com';
const OPS_EMAIL = process.env.OPS_EMAIL || 'ops@bytescare.com';
const SALES_EMAIL = process.env.SALES_EMAIL || 'sales@bytescare.com';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://self-onboarding-rosy.vercel.app';

export async function sendResumeLink(email, resumeToken) {
  const resumeUrl = `${APP_URL}/onboarding?session=${resumeToken}`;
  await resend.emails.send({
    from: FROM,
    to: [email],
    subject: 'Continue your Bytescare onboarding',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <div style="margin-bottom:24px">
          <span style="font-size:22px;font-weight:900;color:#111827">BYTES</span><span style="font-size:22px;font-weight:900;color:#FFA500">CARE</span>
        </div>
        <h2 style="color:#111827;margin-bottom:8px">Your application is saved ✅</h2>
        <p style="color:#6b7280;margin-bottom:24px;line-height:1.6">
          We saved your progress. Use the button below to pick up exactly where you left off — on any device, any browser.
        </p>
        <a href="${resumeUrl}"
          style="display:inline-block;background:#FFA500;color:#111827;font-weight:800;font-size:15px;padding:16px 32px;border-radius:14px;text-decoration:none;">
          Continue My Application →
        </a>
        <p style="color:#9ca3af;font-size:13px;margin-top:20px;">
          Or copy this link: <span style="color:#374151;word-break:break-all;">${resumeUrl}</span>
        </p>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">This link is unique to your application. Don't share it with others.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">© ${new Date().getFullYear()} Bytescare. All rights reserved.</p>
      </div>
    `,
  });
}

function clientName(formData) {
  return formData.type === 'company' ? formData.companyName : formData.individualName;
}

export async function sendClientConfirmation(formData) {
  const name = clientName(formData);
  const recipientEmail = formData.type === 'company'
    ? formData.signatoryEmail || formData.email
    : formData.officialEmail || formData.email;

  await resend.emails.send({
    from: FROM,
    to: [recipientEmail],
    subject: 'Welcome to Bytescare – Onboarding Complete',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <div style="display:flex;align-items:center;gap:4px;margin-bottom:24px">
          <span style="font-size:22px;font-weight:900;color:#111827">BYTES</span>
          <span style="font-size:22px;font-weight:900;color:#FFA500">CARE</span>
        </div>
        <h2 style="color:#111827;margin-bottom:8px">You're officially onboarded! 🎉</h2>
        <p style="color:#6b7280;margin-bottom:20px">Hi ${name}, thank you for completing your onboarding with Bytescare.</p>

        <div style="background:#fffbeb;border:1px solid rgba(255,165,0,0.3);border-radius:12px;padding:16px;margin-bottom:20px">
          <p style="font-weight:700;color:#111827;margin:0 0 8px">What happens next?</p>
          <ul style="color:#374151;margin:0;padding-left:20px;line-height:1.8">
            <li>Our operations team will begin setting up your account</li>
            <li>You will receive your <strong>client dashboard credentials</strong> within 1–2 business days</li>
            <li>Your assigned account manager will reach out shortly</li>
          </ul>
        </div>

        <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:20px">
          <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin:0 0 8px">Services enrolled</p>
          <p style="color:#374151;margin:0">${formData.services.join(' · ')}</p>
        </div>

        <p style="color:#6b7280;font-size:14px">If you have any questions, reply to this email or contact us at <a href="mailto:support@bytescare.com" style="color:#FFA500">support@bytescare.com</a></p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
        <p style="color:#9ca3af;font-size:12px">© ${new Date().getFullYear()} Bytescare. All rights reserved.</p>
      </div>
    `,
  });
}

export async function sendOpsNotification(formData) {
  const isCompany = formData.type === 'company';
  const name = clientName(formData);

  await resend.emails.send({
    from: FROM,
    to: [OPS_EMAIL],
    subject: `[New Onboarding] ${name} – ${formData.type}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#111827">New Onboarding Submission</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#9ca3af;width:180px">Type</td><td style="color:#111827;font-weight:600">${formData.type}</td></tr>
          <tr><td style="padding:6px 0;color:#9ca3af">Name</td><td style="color:#111827">${name}</td></tr>
          <tr><td style="padding:6px 0;color:#9ca3af">Email</td><td style="color:#111827">${formData.email}</td></tr>
          <tr><td style="padding:6px 0;color:#9ca3af">Country</td><td style="color:#111827">${formData.country}</td></tr>
          ${isCompany ? `<tr><td style="padding:6px 0;color:#9ca3af">Signatory</td><td style="color:#111827">${formData.signatoryName} (${formData.signatoryDesignation})</td></tr>` : ''}
          <tr><td style="padding:6px 0;color:#9ca3af">Services</td><td style="color:#111827">${formData.services.join(', ')}</td></tr>
        </table>
        <p style="color:#6b7280;font-size:13px;margin-top:16px">Please begin account setup and send dashboard credentials to the client.</p>
      </div>
    `,
  });
}

export async function sendAbandonedSessionAlert(draft) {
  const formData = draft.formData || {};
  const name = formData.type === 'company' ? formData.companyName : formData.individualName;
  const displayName = name || formData.email || 'Unknown';
  const stuckAtSigning = draft.status === 'signing';

  await resend.emails.send({
    from: FROM,
    to: [SALES_EMAIL],
    subject: stuckAtSigning
      ? `[Agreement Not Signed] ${displayName} – Needs Follow Up`
      : `[Abandoned Onboarding] ${displayName} – Follow Up Required`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#111827">${stuckAtSigning ? 'Agreement Not Signed' : 'Abandoned Onboarding Alert'}</h2>
        <p style="color:#6b7280">${stuckAtSigning
          ? 'A customer reached the document signing step but did not complete signing. They may have questions about the agreement.'
          : 'A customer started onboarding but did not complete it. They may need follow-up.'
        }</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#9ca3af;width:180px">Name</td><td style="color:#111827">${displayName}</td></tr>
          <tr><td style="padding:6px 0;color:#9ca3af">Email</td><td style="color:#111827">${formData.email || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#9ca3af">Type</td><td style="color:#111827">${formData.type || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#9ca3af">Last Active Step</td><td style="color:#111827">${stuckAtSigning ? 'Step 5 – Sign Documents' : `Step ${draft.step}`}</td></tr>
          <tr><td style="padding:6px 0;color:#9ca3af">Last Active</td><td style="color:#111827">${new Date(draft.lastActiveAt).toLocaleString()}</td></tr>
        </table>
      </div>
    `,
  });
}

export async function sendSalesQuestion(formData) {
  const name = formData.type === 'company' ? formData.companyName : formData.individualName;
  const displayName = name || formData.email || 'Unknown';

  await resend.emails.send({
    from: FROM,
    to: [SALES_EMAIL],
    subject: `[Agreement Question] ${displayName} needs help`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#111827">Customer Has Questions About the Agreement</h2>
        <p style="color:#6b7280">A customer reviewing the Service Agreement clicked "Questions?" and requested to be contacted by the sales team.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px">
          <tr><td style="padding:6px 0;color:#9ca3af;width:180px">Name</td><td style="color:#111827">${displayName}</td></tr>
          <tr><td style="padding:6px 0;color:#9ca3af">Email</td><td style="color:#111827">${formData.email || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#9ca3af">Type</td><td style="color:#111827">${formData.type || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#9ca3af">Services</td><td style="color:#111827">${(formData.services || []).join(', ') || '—'}</td></tr>
        </table>
        <p style="color:#6b7280;font-size:13px;margin-top:16px">Please reach out to them at <a href="mailto:${formData.email}" style="color:#FFA500">${formData.email}</a> to address their questions.</p>
      </div>
    `,
  });
}
