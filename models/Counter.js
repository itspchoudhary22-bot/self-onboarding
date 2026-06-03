import mongoose from 'mongoose';

const CounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
});

CounterSchema.statics.nextValue = async function (name) {
  const doc = await this.findOneAndUpdate(
    { name },
    { $inc: { value: 1 } },
    { upsert: true, new: true }
  );
  return doc.value;
};

export default mongoose.models.Counter || mongoose.model('Counter', CounterSchema);
