import { IAttachmentRepository } from '../../../domain/repositories/IAttachmentRepository.js';
import { AttachmentModel } from '../models/AttachmentModel.js';
import { Attachment } from '../../../domain/entities/Attachment.js';

export class AttachmentRepository extends IAttachmentRepository {
  _mapToDomain(doc) {
    if (!doc) return null;
    return Attachment.create({
      id: doc.id,
      employeeId: doc.employeeId,
      officeId: doc.officeId,
      effectiveFrom: doc.effectiveFrom,
      effectiveTo: doc.effectiveTo,
      orderNumber: doc.orderNumber,
      reason: doc.reason
    });
  }

  async findByEmployee(employeeId) {
    const docs = await AttachmentModel.find({ employeeId }).lean();
    return docs.map(doc => this._mapToDomain(doc));
  }

  async findCurrentByEmployee(employeeId) {
    const docs = await AttachmentModel.find({ employeeId, effectiveTo: null }).lean();
    return docs.map(doc => this._mapToDomain(doc));
  }

  async findCurrentByOffice(officeId) {
    const docs = await AttachmentModel.find({ officeId, effectiveTo: null }).lean();
    return docs.map(doc => this._mapToDomain(doc));
  }

  async save(attachment) {
    const doc = new AttachmentModel(attachment);
    await doc.save();
    return this._mapToDomain(doc.toObject());
  }

  async endAttachment(id, effectiveTo = new Date()) {
    const doc = await AttachmentModel.findOneAndUpdate({ id }, { effectiveTo }, { new: true }).lean();
    return this._mapToDomain(doc);
  }
}
