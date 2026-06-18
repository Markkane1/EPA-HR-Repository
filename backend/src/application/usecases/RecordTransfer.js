import { Posting } from '../../domain/entities/Posting.js';

export class RecordTransfer {
  constructor(postingRepo, seatRepo) {
    this.postingRepo = postingRepo;
    this.seatRepo = seatRepo;
  }

  async execute(employeeId, newPostingData) {
    const vacantSeats = await this.seatRepo.findVacantByOffice(newPostingData.officeId);
    if (!vacantSeats.find(s => s.id === newPostingData.seatId)) {
      throw new Error('Transfer failed: New seat is already occupied or does not exist.');
    }

    const currentPostings = await this.postingRepo.findCurrentByEmployee(employeeId);
    if (currentPostings.length > 0) {
      const current = currentPostings[0];
      await this.postingRepo.closePosting(current.id, newPostingData.effectiveFrom || new Date());
      await this.seatRepo.updateStatus(current.seatId, 'vacant');
    }

    const newPosting = Posting.create({ 
      ...newPostingData, 
      employeeId, 
      effectiveFrom: newPostingData.effectiveFrom || new Date() 
    });
    
    await this.postingRepo.save(newPosting);
    await this.seatRepo.updateStatus(newPosting.seatId, 'occupied');
    
    return newPosting;
  }
}
