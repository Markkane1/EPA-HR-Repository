import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class LoginUser {
  constructor(userRepo, jwtSecret) {
    this.userRepo = userRepo;
    this.jwtSecret = jwtSecret || process.env.JWT_SECRET;
    if (!this.jwtSecret) {
      throw new Error('FATAL: JWT_SECRET environment variable is not defined.');
    }
  }

  async execute({ email, password }) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new Error('User account is inactive');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const role = user.role || null;
    const permissions = role?.permissions || [];
    const isSystemAdmin = role?.isSystemRole === true;

    const token = jwt.sign(
      {
        userId: user.id,
        roleId: user.roleId,
        roleName: role?.name || null,
        permissions,
        isSystemAdmin,
        officeId: user.officeId
      },
      this.jwtSecret,
      { expiresIn: '1d' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        role: role,
        officeId: user.officeId
      }
    };
  }
}
