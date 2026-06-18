import { Office } from '../../domain/entities/Office.js';
import crypto from 'crypto';

export class CreateOffice {
  constructor(officeRepository) {
    this.officeRepository = officeRepository;
  }

  async execute(officeData) {
    const id = crypto.randomUUID();
    const office = Office.create({ ...officeData, id });
    return await this.officeRepository.save(office);
  }
}
