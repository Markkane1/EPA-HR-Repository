import { IPostingRepository } from '../../../domain/repositories/IPostingRepository.js';
import { PostingModel } from '../models/PostingModel.js';
import { Posting } from '../../../domain/entities/Posting.js';

export class PostingRepository extends IPostingRepository {
  _mapToDomain(doc) {
    if (!doc) return null;
    return Posting.create({
      id: doc.id,
      employeeId: doc.employeeId,
      seatId: doc.seatId,
      officeId: doc.officeId,
      positionId: doc.positionId,
      effectiveFrom: doc.effectiveFrom,
      effectiveTo: doc.effectiveTo,
      orderNumber: doc.orderNumber,
      remarks: doc.remarks
    });
  }

  async findByEmployee(employeeId) {
    const docs = await PostingModel.find({ employeeId }).lean();
    return docs.map(doc => this._mapToDomain(doc));
  }

  async findCurrentByEmployee(employeeId) {
    const docs = await PostingModel.find({ employeeId, effectiveTo: null }).lean();
    return docs.map(doc => this._mapToDomain(doc));
  }

  async save(posting) {
    const doc = new PostingModel(posting);
    await doc.save();
    return this._mapToDomain(doc.toObject());
  }

  async closePosting(id, effectiveTo) {
    const doc = await PostingModel.findOneAndUpdate({ id }, { effectiveTo }, { new: true }).lean();
    return this._mapToDomain(doc);
  }
}
