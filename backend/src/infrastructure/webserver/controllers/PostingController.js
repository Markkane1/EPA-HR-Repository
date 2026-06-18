import { PostingRepository } from '../../database/repositories/PostingRepository.js';
import { OfficeRepository } from '../../database/repositories/OfficeRepository.js';
import { SeatRepository } from '../../database/repositories/SeatRepository.js';
import { GetPostingHistory } from '../../../application/usecases/GetPostingHistory.js';
import { RecordTransfer } from '../../../application/usecases/RecordTransfer.js';

export class PostingController {
  async history(req, res) {
    try {
      const useCase = new GetPostingHistory(new PostingRepository(), new OfficeRepository());
      // req.params.id will be passed from the employees/:id/postings route
      const data = await useCase.execute(req.params.id);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async transfer(req, res) {
    try {
      const useCase = new RecordTransfer(new PostingRepository(), new SeatRepository());
      const { employeeId, postingData } = req.body;
      const data = await useCase.execute(employeeId, postingData);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
