import { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { UserModel } from '../models/UserModel.js';
import { User } from '../../../domain/entities/User.js';

export class UserRepository extends IUserRepository {
  #mapToDomain(doc) {
    if (!doc) return null;
    return User.create({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      passwordHash: doc.passwordHash,
      role: doc.role,
      officeId: doc.officeId,
      status: doc.status
    });
  }

  async findByEmail(email) {
    const doc = await UserModel.findOne({ email }).lean();
    return this.#mapToDomain(doc);
  }

  async findById(id) {
    const doc = await UserModel.findById(id).lean();
    return this.#mapToDomain(doc);
  }

  async save(user) {
    const doc = await UserModel.findOneAndUpdate(
      { email: user.email }, // Use email as unique constraint for upsert
      {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        officeId: user.officeId,
        status: user.status
      },
      { new: true, upsert: true }
    ).lean();
    return this.#mapToDomain(doc);
  }
}
