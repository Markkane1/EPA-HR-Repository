import mongoose from 'mongoose';

export const positionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  officeId: { type: String, required: true },
  title: { type: String, required: true },
  basicScale: { type: Number },
  totalSeats: { type: Number, required: true }
}, {
  timestamps: true
});

export const PositionModel = mongoose.model('Position', positionSchema);
