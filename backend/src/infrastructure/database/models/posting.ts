import mongoose from 'mongoose';

const postingSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  seatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true },
  effectiveFrom: { type: String, required: true },
  effectiveTo: { type: String, default: null },
  orderNumber: { type: String, required: true },
  remarks: { type: String },
}, {
  timestamps: true,
});

export const PostingModel = mongoose.model('Posting', postingSchema);
