import { Role } from '../../domain/entities/Role.js';

export class CreateRole {
  constructor(roleRepo) {
    this.roleRepo = roleRepo;
  }

  async execute({ name, permissions, isSystemRole }) {
    const existing = await this.roleRepo.findByName(name);
    if (existing) throw new Error(`Role "${name}" already exists.`);

    const role = Role.create({ name, permissions: permissions || [], isSystemRole: isSystemRole || false });
    return await this.roleRepo.save(role);
  }
}
