export class UpdateUser {
  constructor(userRepo) {
    this.userRepo = userRepo;
  }

  async execute(id, { name, email, roleId, officeId, status }) {
    const existing = await this.userRepo.findById(id);
    if (!existing) throw new Error('User not found');

    return await this.userRepo.update(id, { name, email, roleId, officeId, status });
  }
}
