export class Role {
  constructor({ id, name, permissions, isSystemRole }) {
    this.id = id;
    this.name = name;
    this.permissions = permissions || [];
    this.isSystemRole = isSystemRole || false; // e.g. "admin" cannot be deleted
  }

  static create({ id, name, permissions, isSystemRole }) {
    if (!name) {
      throw new Error("Validation Error: Role name is required.");
    }
    return new Role({ id, name, permissions, isSystemRole });
  }
}
