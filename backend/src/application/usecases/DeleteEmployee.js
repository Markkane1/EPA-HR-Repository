export class DeleteEmployee {
  constructor(employeeRepo) {
    this.employeeRepo = employeeRepo;
  }

  async execute(id) {
    const employee = await this.employeeRepo.findById(id);
    if (!employee) {
      throw new Error('Employee not found');
    }
    await this.employeeRepo.delete(id);
    return true;
  }
}
