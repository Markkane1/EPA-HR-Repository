export class GetAllEmployees {
  constructor(employeeRepo, postingRepo, attachmentRepo) {
    this.employeeRepo = employeeRepo;
    this.postingRepo = postingRepo;
    this.attachmentRepo = attachmentRepo;
  }

  async execute(filters = {}) {
    const employees = await this.employeeRepo.findAll(filters);
    
    return Promise.all(employees.map(async emp => {
      const postings = await this.postingRepo.findCurrentByEmployee(emp.id);
      const attachments = await this.attachmentRepo.findCurrentByEmployee(emp.id);
      
      return { 
        ...emp, 
        currentPosting: postings[0] || null, 
        currentAttachment: attachments[0] || null 
      };
    }));
  }
}
