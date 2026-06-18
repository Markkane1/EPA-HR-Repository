import { Employee } from '../../domain/entities/Employee.js';
import { Posting } from '../../domain/entities/Posting.js';

export class CreateEmployee {
  constructor(employeeRepo, postingRepo, seatRepo) {
    this.employeeRepo = employeeRepo;
    this.postingRepo = postingRepo;
    this.seatRepo = seatRepo;
  }

  async execute(employeeData, postingData) {
    const employee = Employee.create(employeeData);
    
    // Check seat vacancy implicitly via findVacantByOffice
    const vacantSeats = await this.seatRepo.findVacantByOffice(postingData.officeId);
    if (!vacantSeats.find(s => s.id === postingData.seatId)) {
      throw new Error('The specified seat is not vacant or does not exist in the office.');
    }

    await this.employeeRepo.save(employee);
    
    const posting = Posting.create({ 
      ...postingData, 
      employeeId: employee.id 
    });
    
    await this.postingRepo.save(posting);
    await this.seatRepo.updateStatus(postingData.seatId, 'occupied');
    
    return employee;
  }
}
