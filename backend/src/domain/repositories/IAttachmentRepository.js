export class IAttachmentRepository {
  async findByEmployee(employeeId) {
    throw new Error('Not implemented');
  }

  async findCurrentByEmployee(employeeId) {
    throw new Error('Not implemented');
  }

  async findCurrentByOffice(officeId) {
    throw new Error('Not implemented');
  }

  async save(attachment) {
    throw new Error('Not implemented');
  }

  async endAttachment(id, effectiveTo) {
    throw new Error('Not implemented');
  }
}
