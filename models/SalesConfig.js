import mongoose from 'mongoose';

// Stores the hashed sales portal password.
// Auto-initialised from SALES_PORTAL_PASSWORD env var on first login attempt.
const SalesConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.SalesConfig || mongoose.model('SalesConfig', SalesConfigSchema);
