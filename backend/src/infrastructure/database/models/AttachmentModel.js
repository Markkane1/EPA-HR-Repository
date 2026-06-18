import mongoose from 'mongoose';

export const attachmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  officeId: { type: String, required: true },
  effectiveFrom: { type: Date, required: true },
  effectiveTo: { type: Date },
  orderNumber: { type: String },
  reason: { type: String, required: true }
}, {
  timestamps: true
});

// Index on employeeId + effectiveTo
attachmentSchema.index({ employeeId: 1, effectiveTo: 1 });

export const AttachmentModel = mongoose.model('Attachment', attachmentSchema);
