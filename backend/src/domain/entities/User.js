export class User {
  constructor({ id, name, email, passwordHash, role, officeId, status }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role || 'viewer';
    this.officeId = officeId || null;
    this.status = status || 'active';
  }

  static create({ id, name, email, passwordHash, role, officeId, status }) {
    if (!name || !email || !passwordHash) {
      throw new Error("Validation Error: Name, email, and passwordHash are required.");
    }
    return new User({ id, name, email, passwordHash, role, officeId, status });
  }
}
