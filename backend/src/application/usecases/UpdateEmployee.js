export class UpdateEmployee {
  constructor(employeeRepository) {
    this.employeeRepository = employeeRepository;
  }

  async execute(id, employeeData) {
    const existingEmployee = await this.employeeRepository.findById(id);
    if (!existingEmployee) {
      throw new Error('Employee not found');
    }

    // Update allowed fields
    const updates = {};
    if (employeeData.name) updates.name = employeeData.name;
    if (employeeData.fatherName !== undefined) updates.fatherName = employeeData.fatherName;
    if (employeeData.cnic) updates.cnic = employeeData.cnic;
    if (employeeData.basicScale) updates.basicScale = employeeData.basicScale;
    
    return await this.employeeRepository.update(id, updates);
  }
}
