import { Router } from 'express';
import { OfficeModel } from '../models/office';

const router = Router();

router.get('/', async (req, res) => {
  const offices = await OfficeModel.find();
  res.json(offices);
});

router.post('/', async (req, res) => {
  const office = new OfficeModel(req.body);
  const saved = await office.save();
  res.status(201).json(saved);
});

router.get('/:id', async (req, res) => {
  const office = await OfficeModel.findById(req.params.id);
  if (!office) return res.status(404).json({ message: 'Office not found' });
  res.json(office);
});

router.put('/:id', async (req, res) => {
  const updated = await OfficeModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Office not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const deleted = await OfficeModel.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Office not found' });
  res.json({ message: 'Office deleted' });
});

export default router;
