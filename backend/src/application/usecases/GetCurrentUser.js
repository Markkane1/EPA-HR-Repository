export class GetCurrentUser {
  constructor(userRepo) {
    this.userRepo = userRepo;
  }

  async execute(userId) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('User not found');
    if (user.status !== 'active') throw new Error('User account is inactive');
    
    // Return full profile including role & permissions
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      role: user.role,
      officeId: user.officeId,
      status: user.status
    };
  }
}
