import { Attachment } from '../../domain/entities/Attachment.js';

export class RecordAttachment {
  constructor(attachmentRepo) {
    this.attachmentRepo = attachmentRepo;
  }

  async execute(attachmentData) {
    const attachment = Attachment.create(attachmentData);
    await this.attachmentRepo.save(attachment);
    return attachment;
  }
}
