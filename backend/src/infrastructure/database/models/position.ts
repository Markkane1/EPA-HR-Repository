import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
  officeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Office', required: true },
  title: { type: String, required: true },
  scale: { type: String, required: true },
  allocatedSeatsCount: { type: Number, required: true },
}, {
  timestamps: true,
});

export const PositionModel = mongoose.model('Position', positionSchema);
