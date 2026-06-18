export class Position {
  constructor(id, officeId, title, basicScale, totalSeats) {
    this.id = id;
    this.officeId = officeId;
    this.title = title;
    this.basicScale = basicScale;
    this.totalSeats = totalSeats;
  }

  static create({ id, officeId, title, basicScale, totalSeats }) {
    if (!id) throw new Error('DomainError: Position ID is required');
    if (!officeId) throw new Error('DomainError: Office ID is required');
    if (!title || title.trim() === '') throw new Error('DomainError: Position title is required');
    if (totalSeats === undefined || totalSeats < 1) throw new Error('DomainError: Total seats must be at least 1');

    return new Position(id, officeId, title, basicScale, totalSeats);
  }
}
