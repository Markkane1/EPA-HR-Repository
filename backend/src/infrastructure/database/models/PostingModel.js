import mongoose from 'mongoose';

export const postingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  seatId: { type: String, required: true },
  officeId: { type: String, required: true },
  positionId: { type: String, required: true },
  effectiveFrom: { type: Date, required: true },
  effectiveTo: { type: Date },
  orderNumber: { type: String },
  remarks: { type: String }
}, {
  timestamps: true
});

// Index on employeeId + effectiveTo
postingSchema.index({ employeeId: 1, effectiveTo: 1 });

export const PostingModel = mongoose.model('Posting', postingSchema);
