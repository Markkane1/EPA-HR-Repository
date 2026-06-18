export class GetAllRoles {
  constructor(roleRepo) {
    this.roleRepo = roleRepo;
  }
  async execute() {
    return await this.roleRepo.findAll();
  }
}
