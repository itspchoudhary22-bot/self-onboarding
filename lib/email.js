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

// ── New functions for sales pipeline ─────────────────────────

export async function sendSubmissionConfirmation(formData) {
  // Same as sendClientConfirmation but messaging updated for the new 4-step flow.
  // Customer gets confirmation that their application is submitted and sales will contact them.
  const name = clientName(formData);
  const recipientEmail = formData.type === 'company'
    ? formData.signatoryEmail || formData.email
    : formData.officialEmail || formData.email;

  await resend.emails.send({
    from: FROM,
    to: [recipientEmail],
    subject: `Bytescare Application Received – ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <div style="margin-bottom:24px">
          <span style="font-size:22px;font-weight:900;color:#111827">BYTES</span><span style="font-size:22px;font-weight:900;color:#FFA500">CARE</span>
        </div>
        <h2 style="color:#111827;margin-bottom:8px">Application Received!</h2>
        <p style="color:#6b7280;margin-bottom:20px;line-height:1.6">
          Hi ${name}, we have received your onboarding application. Our sales team will review it and reach out shortly.
        </p>
        <div style="background:#fffbeb;border:1.5px solid rgba(255,165,0,0.3);border-radius:12px;padding:16px;margin-bottom:20px">
          <p style="font-weight:700;color:#111827;margin:0 0 10px">What happens next?</p>
          <div style="display:flex;flex-direction:column;gap:8px">
            <div style="display:flex;gap:10px;align-items:flex-start">
              <span style="background:#FFA500;color:#111827;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;flex-shrink:0">1</span>
              <span style="color:#374151;font-size:14px">Our sales team reviews your application (usually within 1 business day)</span>
            </div>
            <div style="display:flex;gap:10px;align-items:flex-start">
              <span style="background:#FFA500;color:#111827;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;flex-shrink:0">2</span>
              <span style="color:#374151;font-size:14px">You'll receive an email to review and sign your service agreement</span>
            </div>
            <div style="display:flex;gap:10px;align-items:flex-start">
              <span style="background:#FFA500;color:#111827;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;flex-shrink:0">3</span>
              <span style="color:#374151;font-size:14px">Payment details will be shared once the agreement is signed</span>
            </div>
          </div>
        </div>
        <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:20px">
          <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin:0 0 8px">Services applied for</p>
          <p style="color:#374151;margin:0;font-size:14px">${(formData.services || []).join(' · ')}</p>
        </div>
        <p style="color:#6b7280;font-size:13px;line-height:1.6">
          You can check your application status at any time using the link below.<br/>
          Questions? Email <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@bytescare.com'}" style="color:#FFA500">${process.env.SUPPORT_EMAIL || 'support@bytescare.com'}</a>
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
        <p style="color:#9ca3af;font-size:12px">© ${new Date().getFullYear()} Bytescare. All rights reserved.</p>
      </div>
    `,
  });
}

export async function sendSalesNewApplication(application) {
  // Email to sales team: new ticket assigned
  const isCompany = application.type === 'company';
  const name = isCompany ? application.companyName : application.individualName;
  const salesPortalUrl = `${APP_URL}/sales/application/${application._id}`;

  await resend.emails.send({
    from: FROM,
    to: [SALES_EMAIL],
    subject: `[New Application] ${application.applicationId} – ${name || application.email}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <div style="margin-bottom:20px">
          <span style="font-size:22px;font-weight:900;color:#111827">BYTES</span><span style="font-size:22px;font-weight:900;color:#FFA500">CARE</span>
          <span style="margin-left:8px;background:#111827;color:#FFA500;font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;text-transform:uppercase;letter-spacing:0.05em">Sales Portal</span>
        </div>
        <h2 style="color:#111827;margin-bottom:6px">New Application Received</h2>
        <p style="color:#6b7280;margin-bottom:20px">A new customer has completed onboarding. Please review and process.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px">
          <tr><td style="padding:8px 0;color:#9ca3af;width:160px;border-bottom:1px solid #f3f4f6">Application ID</td><td style="padding:8px 0;color:#111827;font-weight:700;font-family:monospace;border-bottom:1px solid #f3f4f6">${application.applicationId}</td></tr>
          <tr><td style="padding:8px 0;color:#9ca3af;border-bottom:1px solid #f3f4f6">Customer Type</td><td style="padding:8px 0;color:#111827;border-bottom:1px solid #f3f4f6">${application.type}</td></tr>
          <tr><td style="padding:8px 0;color:#9ca3af;border-bottom:1px solid #f3f4f6">Name</td><td style="padding:8px 0;color:#111827;border-bottom:1px solid #f3f4f6">${name || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#9ca3af;border-bottom:1px solid #f3f4f6">Email</td><td style="padding:8px 0;color:#111827;border-bottom:1px solid #f3f4f6">${application.email}</td></tr>
          <tr><td style="padding:8px 0;color:#9ca3af;border-bottom:1px solid #f3f4f6">Country</td><td style="padding:8px 0;color:#111827;border-bottom:1px solid #f3f4f6">${application.country}</td></tr>
          <tr><td style="padding:8px 0;color:#9ca3af">Services</td><td style="padding:8px 0;color:#111827">${(application.services || []).join(', ')}</td></tr>
        </table>
        <a href="${salesPortalUrl}" style="display:inline-block;background:#FFA500;color:#111827;font-weight:800;font-size:14px;padding:14px 28px;border-radius:12px;text-decoration:none;margin-bottom:16px">
          Review Application in Sales Portal →
        </a>
        <p style="color:#9ca3af;font-size:12px">Next steps: Review customer details, set up agreement, configure payment plan, and fill operational requirements.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
        <p style="color:#9ca3af;font-size:12px">© ${new Date().getFullYear()} Bytescare Sales Team.</p>
      </div>
    `,
  });
}

export async function sendAgreementReady(application) {
  // Email to customer: your agreement is ready to sign
  const isCompany = application.type === 'company';
  const name = isCompany ? application.companyName : application.individualName;
  const recipientEmail = isCompany
    ? application.signatoryEmail || application.email
    : application.officialEmail || application.email;
  const statusUrl = `${APP_URL}/onboarding?session=${application.sessionId}`;

  await resend.emails.send({
    from: FROM,
    to: [recipientEmail],
    subject: `Action Required: Sign Your Bytescare Agreement – ${application.applicationId}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <div style="margin-bottom:24px">
          <span style="font-size:22px;font-weight:900;color:#111827">BYTES</span><span style="font-size:22px;font-weight:900;color:#FFA500">CARE</span>
        </div>
        <div style="background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:12px;padding:16px;margin-bottom:20px">
          <p style="font-weight:700;color:#1e40af;margin:0 0 4px">Action Required</p>
          <p style="color:#3b82f6;margin:0;font-size:14px">Your service agreement is ready for review and signing.</p>
        </div>
        <p style="color:#374151;margin-bottom:20px;line-height:1.6">Hi ${name || application.email}, your Bytescare service agreement has been prepared. Please review it carefully and sign to proceed.</p>
        <a href="${statusUrl}" style="display:inline-block;background:#FFA500;color:#111827;font-weight:800;font-size:14px;padding:14px 28px;border-radius:12px;text-decoration:none;margin-bottom:16px">
          Review & Sign Agreement →
        </a>
        <p style="color:#6b7280;font-size:13px;line-height:1.6">Application: <strong>${application.applicationId}</strong><br/>Once signed, our team will finalize your payment plan.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
        <p style="color:#9ca3af;font-size:12px">© ${new Date().getFullYear()} Bytescare. Questions? <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@bytescare.com'}" style="color:#FFA500">Contact support</a></p>
      </div>
    `,
  });
}

export async function sendPaymentEnabled(application) {
  // Email to customer: payment is enabled, go complete it
  const isCompany = application.type === 'company';
  const name = isCompany ? application.companyName : application.individualName;
  const recipientEmail = isCompany
    ? application.signatoryEmail || application.email
    : application.officialEmail || application.email;
  const statusUrl = `${APP_URL}/onboarding?session=${application.sessionId}`;
  const pd = application.paymentDetails || {};

  await resend.emails.send({
    from: FROM,
    to: [recipientEmail],
    subject: `Action Required: Complete Payment – ${application.applicationId}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <div style="margin-bottom:24px">
          <span style="font-size:22px;font-weight:900;color:#111827">BYTES</span><span style="font-size:22px;font-weight:900;color:#FFA500">CARE</span>
        </div>
        <div style="background:#fff7ed;border:1.5px solid #fed7aa;border-radius:12px;padding:16px;margin-bottom:20px">
          <p style="font-weight:700;color:#c2410c;margin:0 0 4px">Payment Ready</p>
          <p style="color:#ea580c;margin:0;font-size:14px">Your payment plan has been configured. Complete payment to activate your account.</p>
        </div>
        <p style="color:#374151;margin-bottom:20px;line-height:1.6">Hi ${name || application.email}, your agreement is signed and your payment plan is ready.</p>
        <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:20px;display:flex;gap:12px;flex-wrap:wrap">
          ${pd.planName ? `<div style="flex:1;min-width:100px"><p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin:0 0 4px">Plan</p><p style="font-size:16px;font-weight:900;color:#111827;margin:0">${pd.planName}</p></div>` : ''}
          ${pd.amount ? `<div style="flex:1;min-width:100px"><p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin:0 0 4px">Amount</p><p style="font-size:16px;font-weight:900;color:#FFA500;margin:0">${pd.currency || 'INR'} ${pd.amount.toLocaleString()}</p></div>` : ''}
          ${pd.frequency ? `<div style="flex:1;min-width:100px"><p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin:0 0 4px">Frequency</p><p style="font-size:16px;font-weight:900;color:#111827;margin:0;text-transform:capitalize">${pd.frequency}</p></div>` : ''}
        </div>
        <a href="${statusUrl}" style="display:inline-block;background:#FFA500;color:#111827;font-weight:800;font-size:14px;padding:14px 28px;border-radius:12px;text-decoration:none;margin-bottom:16px">
          Complete Payment →
        </a>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
        <p style="color:#9ca3af;font-size:12px">© ${new Date().getFullYear()} Bytescare. Questions? <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@bytescare.com'}" style="color:#FFA500">Contact support</a></p>
      </div>
    `,
  });
}

export async function sendOpsRequirements(application) {
  // Email to ops team: new application ready for setup
  const isCompany = application.type === 'company';
  const name = isCompany ? application.companyName : application.individualName;
  const ops = application.operationalRequirements || {};
  const pd = application.paymentDetails || {};

  await resend.emails.send({
    from: FROM,
    to: [OPS_EMAIL],
    subject: `[Ops] ${application.applicationId} – ${name || application.email} – Ready for Setup`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <div style="margin-bottom:20px">
          <span style="font-size:22px;font-weight:900;color:#111827">BYTES</span><span style="font-size:22px;font-weight:900;color:#FFA500">CARE</span>
          <span style="margin-left:8px;background:#0f766e;color:#fff;font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;text-transform:uppercase">Ops</span>
        </div>
        <h2 style="color:#111827;margin-bottom:6px">New Client Ready for Setup</h2>
        <p style="color:#6b7280;margin-bottom:20px">A new client has completed onboarding. Please begin account setup.</p>

        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px">
          <tr><td style="padding:7px 0;color:#9ca3af;width:160px;border-bottom:1px solid #f3f4f6">Application ID</td><td style="padding:7px 0;color:#111827;font-weight:700;font-family:monospace;border-bottom:1px solid #f3f4f6">${application.applicationId}</td></tr>
          <tr><td style="padding:7px 0;color:#9ca3af;border-bottom:1px solid #f3f4f6">Client Name</td><td style="padding:7px 0;color:#111827;border-bottom:1px solid #f3f4f6">${name || '—'}</td></tr>
          <tr><td style="padding:7px 0;color:#9ca3af;border-bottom:1px solid #f3f4f6">Email</td><td style="padding:7px 0;color:#111827;border-bottom:1px solid #f3f4f6">${application.email}</td></tr>
          <tr><td style="padding:7px 0;color:#9ca3af;border-bottom:1px solid #f3f4f6">Services</td><td style="padding:7px 0;color:#111827;border-bottom:1px solid #f3f4f6">${(application.services || []).join(', ')}</td></tr>
          <tr><td style="padding:7px 0;color:#9ca3af;border-bottom:1px solid #f3f4f6">Plan</td><td style="padding:7px 0;color:#111827;border-bottom:1px solid #f3f4f6">${pd.planName || '—'} — ${pd.currency || 'INR'} ${pd.amount || '—'}/${pd.frequency || '—'}</td></tr>
          <tr><td style="padding:7px 0;color:#9ca3af;border-bottom:1px solid #f3f4f6">Priority</td><td style="padding:7px 0;color:#111827;text-transform:capitalize;border-bottom:1px solid #f3f4f6">${ops.priority || 'standard'}</td></tr>
          <tr><td style="padding:7px 0;color:#9ca3af">SLA Start</td><td style="padding:7px 0;color:#111827">${ops.slaStartDate ? new Date(ops.slaStartDate).toLocaleDateString() : '—'}</td></tr>
        </table>

        ${ops.websites || ops.youtubeChannels || ops.socialHandles || ops.brandNames ? `
        <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:16px">
          <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin:0 0 12px">Assets to Protect</p>
          ${ops.websites ? `<p style="margin:0 0 8px"><strong style="color:#374151;font-size:12px">Websites/URLs:</strong><br/><span style="color:#6b7280;font-size:13px">${ops.websites}</span></p>` : ''}
          ${ops.youtubeChannels ? `<p style="margin:0 0 8px"><strong style="color:#374151;font-size:12px">YouTube:</strong><br/><span style="color:#6b7280;font-size:13px">${ops.youtubeChannels}</span></p>` : ''}
          ${ops.socialHandles ? `<p style="margin:0 0 8px"><strong style="color:#374151;font-size:12px">Social:</strong><br/><span style="color:#6b7280;font-size:13px">${ops.socialHandles}</span></p>` : ''}
          ${ops.brandNames ? `<p style="margin:0"><strong style="color:#374151;font-size:12px">Brand Names:</strong><br/><span style="color:#6b7280;font-size:13px">${ops.brandNames}</span></p>` : ''}
        </div>` : ''}

        ${ops.platforms && ops.platforms.length > 0 ? `
        <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:16px">
          <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin:0 0 8px">Monitoring Platforms</p>
          <p style="color:#374151;font-size:13px;margin:0">${ops.platforms.join(', ')}</p>
        </div>` : ''}

        ${ops.instructions ? `
        <div style="background:#fff8e6;border:1px solid rgba(255,165,0,0.3);border-radius:12px;padding:16px;margin-bottom:16px">
          <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;margin:0 0 8px">Special Instructions</p>
          <p style="color:#374151;font-size:13px;margin:0;line-height:1.6">${ops.instructions}</p>
        </div>` : ''}

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
        <p style="color:#9ca3af;font-size:12px">© ${new Date().getFullYear()} Bytescare Operations.</p>
      </div>
    `,
  });
}
