export class GetCurrentUser {
  constructor(userRepo) {
    this.userRepo = userRepo;
  }

  async execute(userId) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('User not found');
    if (user.status !== 'active') throw new Error('User account is inactive');
    
    // Return profile without password hash
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      officeId: user.officeId,
      status: user.status
    };
  }
}
