import { Router } from 'express';
import { PositionModel } from '../models/position';

const router = Router();

router.get('/', async (req, res) => {
  const positions = await PositionModel.find();
  res.json(positions);
});

router.post('/', async (req, res) => {
  const position = new PositionModel(req.body);
  const saved = await position.save();
  res.status(201).json(saved);
});

router.get('/:id', async (req, res) => {
  const position = await PositionModel.findById(req.params.id);
  if (!position) return res.status(404).json({ message: 'Position not found' });
  res.json(position);
});

router.put('/:id', async (req, res) => {
  const updated = await PositionModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Position not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const deleted = await PositionModel.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Position not found' });
  res.json({ message: 'Position deleted' });
});

export default router;
