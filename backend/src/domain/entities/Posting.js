export class Posting {
  constructor(id, employeeId, seatId, officeId, positionId, effectiveFrom, effectiveTo, orderNumber, remarks) {
    this.id = id;
    this.employeeId = employeeId;
    this.seatId = seatId;
    this.officeId = officeId;
    this.positionId = positionId;
    this.effectiveFrom = effectiveFrom;
    this.effectiveTo = effectiveTo;
    this.orderNumber = orderNumber;
    this.remarks = remarks;
  }

  static create({ id, employeeId, seatId, officeId, positionId, effectiveFrom, effectiveTo, orderNumber, remarks }) {
    if (!id) throw new Error('DomainError: Posting ID is required');
    if (!employeeId) throw new Error('DomainError: Employee ID is required');
    if (!seatId) throw new Error('DomainError: Seat ID is required');
    if (!officeId) throw new Error('DomainError: Office ID is required');
    if (!positionId) throw new Error('DomainError: Position ID is required');
    if (!effectiveFrom) throw new Error('DomainError: Effective from date is required');

    if (effectiveTo && new Date(effectiveFrom) > new Date(effectiveTo)) {
      throw new Error('DomainError: Effective from date cannot be later than effective to date');
    }

    return new Posting(id, employeeId, seatId, officeId, positionId, effectiveFrom, effectiveTo, orderNumber, remarks);
  }
}
