export class Employee {
  constructor(id, name, fatherName, cnic, dob, dateOfJoining, basicScale, contactNumber, photoUrl, status) {
    this.id = id;
    this.name = name;
    this.fatherName = fatherName;
    this.cnic = cnic;
    this.dob = dob;
    this.dateOfJoining = dateOfJoining;
    this.basicScale = basicScale;
    this.contactNumber = contactNumber;
    this.photoUrl = photoUrl;
    this.status = status;
  }

  static create({ id, name, fatherName, cnic, dob, dateOfJoining, basicScale, contactNumber, photoUrl, status = 'active' }) {
    if (!id) throw new Error('DomainError: Employee ID is required');
    if (!name || name.trim() === '') throw new Error('DomainError: Employee name is required');
    if (!cnic) throw new Error('DomainError: Employee CNIC is required');
    if (!['active', 'retired', 'transferred'].includes(status)) {
      throw new Error('DomainError: Invalid employee status');
    }

    return new Employee(id, name, fatherName, cnic, dob, dateOfJoining, basicScale, contactNumber, photoUrl, status);
  }
}
