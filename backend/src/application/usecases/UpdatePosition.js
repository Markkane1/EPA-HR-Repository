import crypto from 'crypto';
import { Seat } from '../../domain/entities/Seat.js';

export class UpdatePosition {
  constructor(positionRepository, seatRepository) {
    this.positionRepository = positionRepository;
    this.seatRepository = seatRepository;
  }

  async execute(positionId, data) {
    const position = await this.positionRepository.findById(positionId);
    if (!position) {
      throw new Error('Position not found');
    }

    const seats = await this.seatRepository.findByPosition(positionId);
    const currentTotalSeats = position.totalSeats;
    const newTotalSeats = data.totalSeats !== undefined ? data.totalSeats : currentTotalSeats;

    if (newTotalSeats > currentTotalSeats) {
      // Add seats
      const seatsToAdd = newTotalSeats - currentTotalSeats;
      let maxSeatNumber = seats.length > 0 ? Math.max(...seats.map(s => s.seatNumber)) : 0;
      
      const newSeats = [];
      for (let i = 0; i < seatsToAdd; i++) {
        newSeats.push(Seat.create({
          id: crypto.randomUUID(),
          positionId: position.id,
          officeId: position.officeId,
          seatNumber: ++maxSeatNumber,
          status: 'vacant'
        }));
      }
      await this.seatRepository.saveMany(newSeats);
      
    } else if (newTotalSeats < currentTotalSeats) {
      // Remove seats
      const seatsToRemoveCount = currentTotalSeats - newTotalSeats;
      const vacantSeats = seats.filter(s => s.status === 'vacant').sort((a, b) => b.seatNumber - a.seatNumber);
      
      if (vacantSeats.length < seatsToRemoveCount) {
        throw new Error(`Cannot reduce to ${newTotalSeats} seats. Only ${vacantSeats.length} seats are vacant, but ${seatsToRemoveCount} need to be removed.`);
      }

      const seatsToDelete = vacantSeats.slice(0, seatsToRemoveCount);
      const idsToDelete = seatsToDelete.map(s => s.id);
      await this.seatRepository.deleteMany(idsToDelete);
    }

    // Update Position details
    const updates = {};
    if (data.title) updates.title = data.title;
    if (data.basicScale !== undefined) updates.basicScale = data.basicScale;
    if (data.totalSeats !== undefined) updates.totalSeats = data.totalSeats;

    return await this.positionRepository.update(positionId, updates);
  }
}
