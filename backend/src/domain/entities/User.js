export class User {
  constructor({ id, name, email, passwordHash, role, roleId, officeId, status }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
    this.roleId = roleId || null;
    this.role = role || null; // Will hold the populated Role object
    this.officeId = officeId || null;
    this.status = status || 'active';
  }

  static create({ id, name, email, passwordHash, role, roleId, officeId, status }) {
    if (!name || !email || !passwordHash) {
      throw new Error("Validation Error: Name, email, and passwordHash are required.");
    }
    return new User({ id, name, email, passwordHash, role, roleId, officeId, status });
  }
}
