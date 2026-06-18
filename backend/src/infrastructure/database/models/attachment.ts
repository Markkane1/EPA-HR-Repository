import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  targetOfficeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Office', required: true },
  effectiveFrom: { type: String, required: true },
  effectiveTo: { type: String, default: null },
  orderNumber: { type: String, required: true },
  reason: { type: String, required: true },
}, {
  timestamps: true,
});

export const AttachmentModel = mongoose.model('Attachment', attachmentSchema);
