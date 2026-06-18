export class GetAttachmentHistory {
  constructor(attachmentRepo) {
    this.attachmentRepo = attachmentRepo;
  }

  async execute(employeeId) {
    let attachments = await this.attachmentRepo.findByEmployee(employeeId);
    
    attachments.sort((a, b) => new Date(b.effectiveFrom) - new Date(a.effectiveFrom));
    
    return attachments;
  }
}
