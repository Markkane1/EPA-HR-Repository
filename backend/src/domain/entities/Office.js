export class Office {
  constructor(id, name, type, location, district) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.location = location;
    this.district = district;
  }

  static create({ id, name, type, location, district }) {
    if (!id) throw new Error('DomainError: Office ID is required');
    if (!name || name.trim() === '') throw new Error('DomainError: Office name is required');
    
    const validTypes = ['Directorate', 'Regional Office', 'Field Office'];
    if (!validTypes.includes(type)) {
      throw new Error(`DomainError: Invalid office type. Must be one of: ${validTypes.join(', ')}`);
    }

    if (!location) throw new Error('DomainError: Office location is required');

    return new Office(id, name, type, location, district);
  }
}
