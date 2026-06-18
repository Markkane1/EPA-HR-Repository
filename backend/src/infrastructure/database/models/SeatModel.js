import mongoose from 'mongoose';

export const seatSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  positionId: { type: String, required: true },
  officeId: { type: String, required: true },
  seatNumber: { type: Number, required: true },
  status: { type: String, enum: ['occupied', 'vacant'], default: 'vacant' }
}, {
  timestamps: true
});

export const SeatModel = mongoose.model('Seat', seatSchema);
