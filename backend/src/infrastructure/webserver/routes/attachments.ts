import { Router } from 'express';
import { AttachmentModel } from '../models/attachment';

const router = Router();

router.get('/', async (req, res) => {
  const attachments = await AttachmentModel.find();
  res.json(attachments);
});

router.post('/', async (req, res) => {
  const attachment = new AttachmentModel(req.body);
  const saved = await attachment.save();
  res.status(201).json(saved);
});

router.get('/:id', async (req, res) => {
  const attachment = await AttachmentModel.findById(req.params.id);
  if (!attachment) return res.status(404).json({ message: 'Attachment not found' });
  res.json(attachment);
});

router.put('/:id', async (req, res) => {
  const updated = await AttachmentModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Attachment not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const deleted = await AttachmentModel.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Attachment not found' });
  res.json({ message: 'Attachment deleted' });
});

export default router;
