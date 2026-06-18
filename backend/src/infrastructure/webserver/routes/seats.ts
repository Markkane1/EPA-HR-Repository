import { Router } from 'express';
import { SeatModel } from '../models/seat';

const router = Router();

router.get('/', async (req, res) => {
  const seats = await SeatModel.find();
  res.json(seats);
});

router.post('/', async (req, res) => {
  const seat = new SeatModel(req.body);
  const saved = await seat.save();
  res.status(201).json(saved);
});

router.get('/:id', async (req, res) => {
  const seat = await SeatModel.findById(req.params.id);
  if (!seat) return res.status(404).json({ message: 'Seat not found' });
  res.json(seat);
});

router.put('/:id', async (req, res) => {
  const updated = await SeatModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Seat not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const deleted = await SeatModel.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Seat not found' });
  res.json({ message: 'Seat deleted' });
});

export default router;
