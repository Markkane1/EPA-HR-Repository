export class Attachment {
  constructor(id, employeeId, officeId, effectiveFrom, effectiveTo, orderNumber, reason) {
    this.id = id;
    this.employeeId = employeeId;
    this.officeId = officeId;
    this.effectiveFrom = effectiveFrom;
    this.effectiveTo = effectiveTo;
    this.orderNumber = orderNumber;
    this.reason = reason;
  }

  static create({ id, employeeId, officeId, effectiveFrom, effectiveTo, orderNumber, reason }) {
    if (!id) throw new Error('DomainError: Attachment ID is required');
    if (!employeeId) throw new Error('DomainError: Employee ID is required');
    if (!officeId) throw new Error('DomainError: Office ID is required');
    if (!effectiveFrom) throw new Error('DomainError: Effective from date is required');
    if (!reason || reason.trim() === '') throw new Error('DomainError: Reason for attachment is required');

    if (effectiveTo && new Date(effectiveFrom) > new Date(effectiveTo)) {
      throw new Error('DomainError: Effective from date cannot be later than effective to date');
    }

    return new Attachment(id, employeeId, officeId, effectiveFrom, effectiveTo, orderNumber, reason);
  }
}
