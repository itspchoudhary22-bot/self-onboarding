import mongoose from 'mongoose';

const DraftSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  resumeToken: { type: String, unique: true, sparse: true },
  email: { type: String, default: '' },
  step: { type: Number, default: 1 },
  status: { type: String, default: 'draft', enum: ['draft', 'signing', 'submitted'] },
  pandadocDocumentId: { type: String, default: '' },
  formData: { type: mongoose.Schema.Types.Mixed, required: true },
  lastActiveAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Draft || mongoose.model('Draft', DraftSchema);
