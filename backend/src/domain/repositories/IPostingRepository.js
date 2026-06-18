export class IPostingRepository {
  async findByEmployee(employeeId) {
    throw new Error('Not implemented');
  }

  async findCurrentByEmployee(employeeId) {
    throw new Error('Not implemented');
  }

  async save(posting) {
    throw new Error('Not implemented');
  }

  async closePosting(id, effectiveTo) {
    throw new Error('Not implemented');
  }
}
