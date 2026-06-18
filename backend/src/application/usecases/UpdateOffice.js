export class UpdateOffice {
  constructor(officeRepository) {
    this.officeRepository = officeRepository;
  }

  async execute(id, officeData) {
    const existingOffice = await this.officeRepository.findById(id);
    if (!existingOffice) {
      throw new Error('Office not found');
    }

    // Update allowed fields
    if (officeData.name) existingOffice.name = officeData.name;
    if (officeData.type) existingOffice.type = officeData.type;
    if (officeData.location) existingOffice.location = officeData.location;
    if (officeData.district) existingOffice.district = officeData.district;

    return await this.officeRepository.save(existingOffice);
  }
}
