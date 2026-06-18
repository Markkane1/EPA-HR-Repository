import { ISeatRepository } from '../../../domain/repositories/ISeatRepository.js';
import { SeatModel } from '../models/SeatModel.js';
import { Seat } from '../../../domain/entities/Seat.js';

export class SeatRepository extends ISeatRepository {
  _mapToDomain(doc) {
    if (!doc) return null;
    return Seat.create({
      id: doc.id,
      positionId: doc.positionId,
      officeId: doc.officeId,
      seatNumber: doc.seatNumber,
      status: doc.status
    });
  }

  async findByPosition(positionId) {
    const docs = await SeatModel.find({ positionId }).lean();
    return docs.map(doc => this._mapToDomain(doc));
  }

  async findVacantByOffice(officeId) {
    const docs = await SeatModel.find({ officeId, status: 'vacant' }).lean();
    return docs.map(doc => this._mapToDomain(doc));
  }

  async updateStatus(id, status) {
    const doc = await SeatModel.findOneAndUpdate({ id }, { status }, { new: true }).lean();
    return this._mapToDomain(doc);
  }

  async saveMany(seats) {
    const operations = seats.map(seat => ({
      updateOne: {
        filter: { id: seat.id },
        update: {
          $set: {
            id: seat.id,
            positionId: seat.positionId,
            officeId: seat.officeId,
            seatNumber: seat.seatNumber,
            status: seat.status
          }
        },
        upsert: true
      }
    }));
    await SeatModel.bulkWrite(operations);
    return seats;
  }
}
