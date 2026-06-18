export class GetPostingHistory {
  constructor(postingRepo, officeRepo) {
    this.postingRepo = postingRepo;
    this.officeRepo = officeRepo;
  }

  async execute(employeeId) {
    let postings = await this.postingRepo.findByEmployee(employeeId);
    
    postings.sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom));
    
    return Promise.all(postings.map(async p => {
      const office = await this.officeRepo.findById(p.officeId);
      return { 
        ...p, 
        office 
      };
    }));
  }
}
