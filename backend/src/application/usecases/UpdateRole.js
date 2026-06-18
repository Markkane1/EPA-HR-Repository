export class UpdateRole {
  constructor(roleRepo) {
    this.roleRepo = roleRepo;
  }

  async execute(id, { name, permissions }) {
    const existing = await this.roleRepo.findById(id);
    if (!existing) throw new Error('Role not found');
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (permissions !== undefined) updateData.permissions = permissions;

    return await this.roleRepo.update(id, updateData);
  }
}
