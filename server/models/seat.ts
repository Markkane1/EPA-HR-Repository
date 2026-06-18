import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
  positionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', required: true },
  name: { type: String, required: true },
}, {
  timestamps: true,
});

export const SeatModel = mongoose.model('Seat', seatSchema);
