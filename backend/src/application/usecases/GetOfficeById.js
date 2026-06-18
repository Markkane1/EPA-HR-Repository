export class GetOfficeById {
  constructor(officeRepo, positionRepo, seatRepo, employeeRepo, attachmentRepo, postingRepo) {
    this.officeRepo = officeRepo;
    this.positionRepo = positionRepo;
    this.seatRepo = seatRepo;
    this.employeeRepo = employeeRepo;
    this.attachmentRepo = attachmentRepo;
    this.postingRepo = postingRepo;
  }

  async execute(officeId) {
    const office = await this.officeRepo.findById(officeId);
    if (!office) throw new Error('Office not found');

    const positions = await this.positionRepo.findByOffice(officeId);
    
    let allSeats = [];
    for (const pos of positions) {
      const posSeats = await this.seatRepo.findByPosition(pos.id);
      allSeats = allSeats.concat(posSeats);
    }

    const currentOccupants = await this.employeeRepo.findAll({ officeId });
    const currentlyAttached = await this.attachmentRepo.findCurrentByOffice(officeId);
    
    // We also need to fetch postings to map occupants to seats
    const allPostings = await Promise.all(currentOccupants.map(emp => this.postingRepo.findCurrentByEmployee(emp.id)));
    const currentPostings = allPostings.flat();

    return { 
      office, 
      positions, 
      seats: allSeats, 
      currentOccupants, 
      currentlyAttached,
      currentPostings
    };
  }
}
