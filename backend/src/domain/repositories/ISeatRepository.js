export class ISeatRepository {
  async findByPosition(positionId) {
    throw new Error('Not implemented');
  }

  async findVacantByOffice(officeId) {
    throw new Error('Not implemented');
  }

  async updateStatus(id, status) {
    throw new Error('Not implemented');
  }
  async saveMany(seats) {
    throw new Error('Not implemented');
  }
}
