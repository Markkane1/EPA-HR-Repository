import { Position } from '../../domain/entities/Position.js';
import { Seat } from '../../domain/entities/Seat.js';
import crypto from 'crypto';

export class CreatePosition {
  constructor(positionRepository, seatRepository, officeRepository) {
    this.positionRepository = positionRepository;
    this.seatRepository = seatRepository;
    this.officeRepository = officeRepository;
  }

  async execute({ officeId, title, basicScale, totalSeats }) {
    // 1. Verify Office exists
    const office = await this.officeRepository.findById(officeId);
    if (!office) throw new Error('Office not found');

    // 2. Create Position
    const positionId = crypto.randomUUID();
    const position = Position.create({
      id: positionId,
      officeId,
      title,
      basicScale,
      totalSeats
    });

    await this.positionRepository.save(position);

    // 3. Generate Seats
    const seats = [];
    for (let i = 1; i <= totalSeats; i++) {
      const seat = Seat.create({
        id: crypto.randomUUID(),
        positionId: positionId,
        officeId: officeId,
        seatNumber: i,
        status: 'vacant'
      });
      seats.push(seat);
    }

    await this.seatRepository.saveMany(seats);

    return position;
  }
}
