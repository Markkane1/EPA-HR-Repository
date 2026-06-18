import { EmployeeRepository } from '../../database/repositories/EmployeeRepository.js';
import { PostingRepository } from '../../database/repositories/PostingRepository.js';
import { AttachmentRepository } from '../../database/repositories/AttachmentRepository.js';
import { SeatRepository } from '../../database/repositories/SeatRepository.js';
import { GetAllEmployees } from '../../../application/usecases/GetAllEmployees.js';
import { GetEmployeeById } from '../../../application/usecases/GetEmployeeById.js';
import { CreateEmployee } from '../../../application/usecases/CreateEmployee.js';
import { UpdateEmployee } from '../../../application/usecases/UpdateEmployee.js';

export class EmployeeController {
  async index(req, res) {
    try {
      const useCase = new GetAllEmployees(
        new EmployeeRepository(),
        new PostingRepository(),
        new AttachmentRepository()
      );
      const data = await useCase.execute(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const useCase = new GetEmployeeById(
        new EmployeeRepository(),
        new PostingRepository(),
        new AttachmentRepository()
      );
      const data = await useCase.execute(req.params.id);
      res.json(data);
    } catch (error) {
      if (error.message === 'Employee not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async create(req, res) {
    try {
      const useCase = new CreateEmployee(
        new EmployeeRepository(),
        new PostingRepository(),
        new SeatRepository()
      );
      const { employeeData, postingData } = req.body;
      const data = await useCase.execute(employeeData, postingData);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const useCase = new UpdateEmployee(new EmployeeRepository());
      const employee = await useCase.execute(req.params.id, req.body);
      res.json(employee);
    } catch (error) {
      if (error.message === 'Employee not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}
