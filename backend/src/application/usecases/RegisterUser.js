import bcrypt from 'bcrypt';
import { User } from '../../domain/entities/User.js';

export class RegisterUser {
  constructor(userRepo) {
    this.userRepo = userRepo;
  }

  async execute({ name, email, password, roleId, officeId }) {
    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = User.create({
      name,
      email,
      passwordHash,
      roleId: roleId || null,
      officeId,
      status: 'active'
    });

    return await this.userRepo.save(user);
  }
}
