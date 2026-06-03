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
  services: { type: [String], default: [] },
  serviceDetails: { type: mongoose.Schema.Types.Mixed, default: {} },

  // ── Session / Draft link ──────────────────────────────────────────────────
  sessionId: { type: String, default: '' },

  // ── Agreement (filled by sales team) ─────────────────────────────────────
  agreementDetails: { type: mongoose.Schema.Types.Mixed, default: null },

  // ── Payment (filled by sales team) ───────────────────────────────────────
  paymentDetails: { type: mongoose.Schema.Types.Mixed, default: null },

  // ── Operational Requirements (filled by sales team, sent to ops) ──────────
  operationalRequirements: { type: mongoose.Schema.Types.Mixed, default: null },

  // ── Sales notes ───────────────────────────────────────────────────────────
  salesNotes: { type: String, default: '' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ApplicationSchema.pre('save', async function () {
  this.updatedAt = new Date();
});

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
