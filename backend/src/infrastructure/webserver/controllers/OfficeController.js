import { OfficeRepository } from '../../database/repositories/OfficeRepository.js';
import { PositionRepository } from '../../database/repositories/PositionRepository.js';
import { SeatRepository } from '../../database/repositories/SeatRepository.js';
import { EmployeeRepository } from '../../database/repositories/EmployeeRepository.js';
import { AttachmentRepository } from '../../database/repositories/AttachmentRepository.js';
import { PostingRepository } from '../../database/repositories/PostingRepository.js';
import { GetOfficeById } from '../../../application/usecases/GetOfficeById.js';
import { CreateOffice } from '../../../application/usecases/CreateOffice.js';
import { CreatePosition } from '../../../application/usecases/CreatePosition.js';
import { UpdateOffice } from '../../../application/usecases/UpdateOffice.js';

export class OfficeController {
  async index(req, res) {
    try {
      const repo = new OfficeRepository();
      const offices = await repo.findAll();
      res.json(offices);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const useCase = new GetOfficeById(
        new OfficeRepository(),
        new PositionRepository(),
        new SeatRepository(),
        new EmployeeRepository(),
        new AttachmentRepository(),
        new PostingRepository()
      );
      const data = await useCase.execute(req.params.id);
      res.json(data);
    } catch (error) {
      if (error.message === 'Office not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      const useCase = new CreateOffice(new OfficeRepository());
      const office = await useCase.execute(req.body);
      res.status(201).json(office);
    } catch (error) {
      if (error.message.startsWith('DomainError')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async createPosition(req, res) {
    try {
      const useCase = new CreatePosition(
        new PositionRepository(),
        new SeatRepository(),
        new OfficeRepository()
      );
      const position = await useCase.execute({
        officeId: req.params.id,
        ...req.body
      });
      res.status(201).json(position);
    } catch (error) {
      if (error.message === 'Office not found' || error.message.startsWith('DomainError')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const useCase = new UpdateOffice(new OfficeRepository());
      const office = await useCase.execute(req.params.id, req.body);
      res.json(office);
    } catch (error) {
      if (error.message === 'Office not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.startsWith('DomainError')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}
