import mongoose from 'mongoose';

const CustomerSessionSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  otpHash: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },
  sessionToken: { type: String, default: null, index: true, sparse: true },
  sessionExpiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 32 }, // auto-delete after 32 days
});

export default mongoose.models.CustomerSession || mongoose.model('CustomerSession', CustomerSessionSchema);
