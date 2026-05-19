import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['individual', 'company'],
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  services: {
    type: [String],
    required: true,
    validate: {
      validator: (v) => v.length > 0,
      message: 'At least one service must be selected',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Application ||
  mongoose.model('Application', ApplicationSchema);
