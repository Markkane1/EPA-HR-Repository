import mongoose from 'mongoose';

const officeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  location: { type: String, required: true },
  district: { type: String, required: true },
}, {
  timestamps: true,
});

export const OfficeModel = mongoose.model('Office', officeSchema);
