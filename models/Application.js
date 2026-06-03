import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  // ── Identity ─────────────────────────────────────────────────────────────
  applicationId: { type: String, unique: true, sparse: true }, // BC-YYYY-XXXX
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  type: { type: String, required: true, enum: ['individual', 'company'] },
  country: { type: String, default: '' },

  // ── Status ───────────────────────────────────────────────────────────────
  status: {
    type: String,
    default: 'pending_review',
    enum: ['pending_review', 'agreement_pending', 'payment_pending', 'ops_setup', 'active'],
  },

  // ── Individual fields ─────────────────────────────────────────────────────
  individualName: { type: String, default: '' },
  nationalIdNumber: { type: String, default: '' },
  idProofName: { type: String, default: '' },
  idProofBase64: { type: String, default: '' },
  contactNumber: { type: String, default: '' },
  registeredAddress: { type: String, default: '' },
  pincode: { type: String, default: '' },
  mailingAddress: { type: String, default: '' },
  officialEmail: { type: String, default: '' },
  designation: { type: String, default: '' },
  workDescription: { type: String, default: '' },
  socialMediaHandles: { type: String, default: '' },

  // ── Company fields ────────────────────────────────────────────────────────
  companyName: { type: String, default: '' },
  companyRegNumber: { type: String, default: '' },
  regCertName: { type: String, default: '' },
  regCertBase64: { type: String, default: '' },
  gstin: { type: String, default: '' },
  companyContact: { type: String, default: '' },
  companyRegisteredAddress: { type: String, default: '' },
  companyPincode: { type: String, default: '' },
  companyMailingAddress: { type: String, default: '' },
  companyDescription: { type: String, default: '' },
  signatoryName: { type: String, default: '' },
  signatoryDesignation: { type: String, default: '' },
  signatoryEmail: { type: String, default: '' },
  companySocialMedia: { type: String, default: '' },
  companyOfficialEmail: { type: String, default: '' },
  copyrightCertName: { type: String, default: '' },
  copyrightCertBase64: { type: String, default: '' },

  // ── Services ──────────────────────────────────────────────────────────────
  services: { type: [String], required: true },
  serviceDetails: { type: mongoose.Schema.Types.Mixed, default: {} },

  // ── Session / Draft link ──────────────────────────────────────────────────
  sessionId: { type: String, default: '' },

  // ── Agreement (filled by sales team) ─────────────────────────────────────
  agreementDetails: {
    type: {
      agreementType: { type: String, enum: ['template', 'unsigned', 'signed'] },
      pandadocDocumentId: { type: String, default: '' },
      pandadocSigningUrl: { type: String, default: '' },
      pandadocStatus: { type: String, default: '' },
      uploadedFileName: { type: String, default: '' },
      sentToCustomerAt: { type: Date },
      signedAt: { type: Date },
      completedAt: { type: Date },
    },
    default: null,
  },

  // ── Payment (filled by sales team) ───────────────────────────────────────
  paymentDetails: {
    type: {
      planName: { type: String, default: '' },
      currency: { type: String, default: 'INR' },
      amount: { type: Number, default: 0 },
      frequency: { type: String, default: 'monthly' }, // monthly|quarterly|biannually|annually
      serviceDuration: { type: String, default: '1year' }, // 3months|6months|1year|custom
      startDate: { type: Date },
      endDate: { type: Date },
      method: { type: String, enum: ['portal', 'offline'], default: 'portal' },
      enabledAt: { type: Date },
      paidAt: { type: Date },
      razorpayOrderId: { type: String, default: '' },
      razorpayPaymentId: { type: String, default: '' },
    },
    default: null,
  },

  // ── Operational Requirements (filled by sales team, sent to ops) ──────────
  operationalRequirements: {
    type: {
      websites: { type: String, default: '' },
      youtubeChannels: { type: String, default: '' },
      socialHandles: { type: String, default: '' },
      brandNames: { type: String, default: '' },
      platforms: { type: [String], default: [] },
      priority: { type: String, enum: ['standard', 'high', 'critical'], default: 'standard' },
      instructions: { type: String, default: '' },
      slaStartDate: { type: Date },
      sentToOpsAt: { type: Date },
    },
    default: null,
  },

  // ── Sales notes ───────────────────────────────────────────────────────────
  salesNotes: { type: String, default: '' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ApplicationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
