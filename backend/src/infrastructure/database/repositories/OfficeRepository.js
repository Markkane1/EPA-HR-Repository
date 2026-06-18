import { IOfficeRepository } from '../../../domain/repositories/IOfficeRepository.js';
import { OfficeModel } from '../models/OfficeModel.js';
import { Office } from '../../../domain/entities/Office.js';

export class OfficeRepository extends IOfficeRepository {
  _mapToDomain(doc) {
    if (!doc) return null;
    return Office.create({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      location: doc.location,
      district: doc.district
    });
  }

  async findAll() {
    const docs = await OfficeModel.find({}).lean();
    return docs.map(doc => this._mapToDomain(doc));
  }

  async findById(id) {
    const doc = await OfficeModel.findOne({ id }).lean();
    return this._mapToDomain(doc);
  }

  async save(office) {
    const doc = await OfficeModel.findOneAndUpdate(
      { id: office.id },
      {
        id: office.id,
        name: office.name,
        type: office.type,
        location: office.location,
        district: office.district
      },
      { new: true, upsert: true }
    ).lean();
    return this._mapToDomain(doc);
  }
}
