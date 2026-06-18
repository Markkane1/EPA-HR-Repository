export class EndAttachment {
  constructor(attachmentRepo) {
    this.attachmentRepo = attachmentRepo;
  }

  async execute(attachmentId, effectiveTo = new Date()) {
    return await this.attachmentRepo.endAttachment(attachmentId, effectiveTo);
  }
}
