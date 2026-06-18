import crypto from 'crypto';
import { Attachment } from '../../domain/entities/Attachment.js';

export class RecordAttachment {
  constructor(attachmentRepo) {
    this.attachmentRepo = attachmentRepo;
  }

  async execute(attachmentData) {
    if (!attachmentData.id) {
      attachmentData.id = crypto.randomUUID();
    }
    const attachment = Attachment.create(attachmentData);
    await this.attachmentRepo.save(attachment);
    return attachment;
  }
}
