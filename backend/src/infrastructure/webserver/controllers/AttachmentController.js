import { AttachmentRepository } from '../../database/repositories/AttachmentRepository.js';
import { GetAttachmentHistory } from '../../../application/usecases/GetAttachmentHistory.js';
import { RecordAttachment } from '../../../application/usecases/RecordAttachment.js';
import { EndAttachment } from '../../../application/usecases/EndAttachment.js';

export class AttachmentController {
  async history(req, res) {
    try {
      const useCase = new GetAttachmentHistory(new AttachmentRepository());
      const data = await useCase.execute(req.params.id);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      const useCase = new RecordAttachment(new AttachmentRepository());
      const data = await useCase.execute(req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async end(req, res) {
    try {
      const useCase = new EndAttachment(new AttachmentRepository());
      const { effectiveTo } = req.body;
      const data = await useCase.execute(req.params.id, effectiveTo);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
