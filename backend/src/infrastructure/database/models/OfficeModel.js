import mongoose from 'mongoose';

export const officeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Directorate', 'Regional Office', 'Field Office'], required: true },
  location: { type: String, required: true },
  district: { type: String }
}, {
  timestamps: true
});

export const OfficeModel = mongoose.model('Office', officeSchema);
