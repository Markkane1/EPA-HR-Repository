import { IPositionRepository } from '../../../domain/repositories/IPositionRepository.js';
import { PositionModel } from '../models/PositionModel.js';
import { Position } from '../../../domain/entities/Position.js';

export class PositionRepository extends IPositionRepository {
  _mapToDomain(doc) {
    if (!doc) return null;
    return Position.create({
      id: doc.id,
      officeId: doc.officeId,
      title: doc.title,
      basicScale: doc.basicScale,
      totalSeats: doc.totalSeats
    });
  }

  async findByOffice(officeId) {
    const docs = await PositionModel.find({ officeId }).lean();
    return docs.map(doc => this._mapToDomain(doc));
  }

  async findById(id) {
    const doc = await PositionModel.findOne({ id }).lean();
    return this._mapToDomain(doc);
  }

  async save(position) {
    const doc = await PositionModel.findOneAndUpdate(
      { id: position.id },
      {
        id: position.id,
        officeId: position.officeId,
        title: position.title,
        basicScale: position.basicScale,
        totalSeats: position.totalSeats
      },
      { new: true, upsert: true }
    ).lean();
    return this._mapToDomain(doc);
  }

  async update(id, data) {
    const doc = await PositionModel.findOneAndUpdate({ id }, data, { new: true }).lean();
    return this._mapToDomain(doc);
  }

  async delete(id) {
    await PositionModel.findOneAndDelete({ id });
  }
}
