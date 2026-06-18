import { EmployeeRepository } from '../../database/repositories/EmployeeRepository.js';
import { OfficeRepository } from '../../database/repositories/OfficeRepository.js';
import { SeatRepository } from '../../database/repositories/SeatRepository.js';
import { AttachmentRepository } from '../../database/repositories/AttachmentRepository.js';
import { PositionRepository } from '../../database/repositories/PositionRepository.js';
import { GetDashboardStats } from '../../../application/usecases/GetDashboardStats.js';

export class DashboardController {
  async stats(req, res) {
    try {
      const useCase = new GetDashboardStats(
        new EmployeeRepository(),
        new OfficeRepository(),
        new SeatRepository(),
        new AttachmentRepository(),
        new PositionRepository()
      );
      const data = await useCase.execute();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
