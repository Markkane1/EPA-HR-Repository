export class DeleteRole {
  constructor(roleRepo) {
    this.roleRepo = roleRepo;
  }

  async execute(id) {
    const existing = await this.roleRepo.findById(id);
    if (!existing) throw new Error('Role not found');
    if (existing.isSystemRole) throw new Error('System roles cannot be deleted.');
    return await this.roleRepo.delete(id);
  }
}
