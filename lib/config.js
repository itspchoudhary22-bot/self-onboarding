// Central config — every env var in one place.
// Add new vars here; never read process.env directly elsewhere.

const cfg = {
  // ── MongoDB ────────────────────────────────────────────────
  mongoUri: process.env.MONGODB_URI,

  // ── Email (Resend) ─────────────────────────────────────────
  resendApiKey: process.env.RESEND_API_KEY,
  fromEmail: process.env.FROM_EMAIL || 'onboarding@bytescare.com',
  opsEmail: process.env.OPS_EMAIL || 'ops@bytescare.com',
  salesEmail: process.env.SALES_EMAIL || 'sales@bytescare.com',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@bytescare.com',

  // ── PandaDoc ───────────────────────────────────────────────
  pandadocApiKey: process.env.PANDADOC_API_KEY,
  pandadocSaTemplateId: process.env.PANDADOC_SERVICE_AGREEMENT_TEMPLATE_ID,
  pandadocLoaTemplateId: process.env.PANDADOC_LOA_TEMPLATE_ID,

  // ── Razorpay ───────────────────────────────────────────────
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,

  // ── Sales portal ───────────────────────────────────────────
  salesPortalPassword: process.env.SALES_PORTAL_PASSWORD || 'bytescare-sales-2026',
  salesJwtSecret: process.env.SALES_JWT_SECRET || 'change-this-secret-in-production',
  salesSessionHours: 8,

  // ── App ────────────────────────────────────────────────────
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  cronSecret: process.env.CRON_SECRET,
};

export default cfg;
