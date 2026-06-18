export class GetEmployeeById {
  constructor(employeeRepo, postingRepo, attachmentRepo) {
    this.employeeRepo = employeeRepo;
    this.postingRepo = postingRepo;
    this.attachmentRepo = attachmentRepo;
  }

  async execute(id) {
    const employee = await this.employeeRepo.findById(id);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const postings = await this.postingRepo.findCurrentByEmployee(employee.id);
    const attachments = await this.attachmentRepo.findCurrentByEmployee(employee.id);

    return { 
      ...employee, 
      currentPosting: postings[0] || null, 
      currentAttachment: attachments[0] || null 
    };
  }
}
