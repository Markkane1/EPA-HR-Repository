export class Seat {
  constructor(id, positionId, officeId, seatNumber, status) {
    this.id = id;
    this.positionId = positionId;
    this.officeId = officeId;
    this.seatNumber = seatNumber;
    this.status = status;
  }

  static create({ id, positionId, officeId, seatNumber, status = 'vacant' }) {
    if (!id) throw new Error('DomainError: Seat ID is required');
    if (!positionId) throw new Error('DomainError: Position ID is required');
    if (!officeId) throw new Error('DomainError: Office ID is required');
    if (seatNumber === undefined) throw new Error('DomainError: Seat number is required');

    if (!['occupied', 'vacant'].includes(status)) {
      throw new Error('DomainError: Invalid seat status. Must be occupied or vacant.');
    }

    return new Seat(id, positionId, officeId, seatNumber, status);
  }
}
