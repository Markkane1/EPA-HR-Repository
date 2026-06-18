export class DeletePosition {
  constructor(positionRepository, seatRepository) {
    this.positionRepository = positionRepository;
    this.seatRepository = seatRepository;
  }

  async execute(positionId) {
    const position = await this.positionRepository.findById(positionId);
    if (!position) {
      throw new Error('Position not found');
    }

    const seats = await this.seatRepository.findByPosition(positionId);
    
    // Check if any seat is occupied
    const occupiedSeats = seats.filter(s => s.status === 'occupied');
    if (occupiedSeats.length > 0) {
      throw new Error(`Cannot delete position because ${occupiedSeats.length} seats are currently occupied.`);
    }

    // Delete all seats
    if (seats.length > 0) {
      const idsToDelete = seats.map(s => s.id);
      await this.seatRepository.deleteMany(idsToDelete);
    }

    // Delete position
    await this.positionRepository.delete(positionId);

    return true;
  }
}
