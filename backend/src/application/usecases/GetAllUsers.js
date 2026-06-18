export class GetAllUsers {
  constructor(userRepo) {
    this.userRepo = userRepo;
  }

  async execute() {
    const users = await this.userRepo.findAll();
    // Strip password hashes
    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      roleId: u.roleId,
      role: u.role,
      officeId: u.officeId,
      status: u.status
    }));
  }
}
