import { Router } from 'express';
import { PostingModel } from '../models/posting';

const router = Router();

router.get('/', async (req, res) => {
  const postings = await PostingModel.find();
  res.json(postings);
});

router.post('/', async (req, res) => {
  const posting = new PostingModel(req.body);
  const saved = await posting.save();
  res.status(201).json(saved);
});

router.get('/:id', async (req, res) => {
  const posting = await PostingModel.findById(req.params.id);
  if (!posting) return res.status(404).json({ message: 'Posting not found' });
  res.json(posting);
});

router.put('/:id', async (req, res) => {
  const updated = await PostingModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Posting not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const deleted = await PostingModel.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Posting not found' });
  res.json({ message: 'Posting deleted' });
});

export default router;
