import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class LoginUser {
  constructor(userRepo, jwtSecret) {
    this.userRepo = userRepo;
    this.jwtSecret = jwtSecret || process.env.JWT_SECRET || 'fallback_secret';
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

    const token = jwt.sign(
      { userId: user.id, role: user.role, officeId: user.officeId },
      this.jwtSecret,
      { expiresIn: '1d' }
    );

    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, officeId: user.officeId } };
  }
}
