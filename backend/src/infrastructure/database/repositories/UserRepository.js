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
      roleId: doc.roleId?._id?.toString() || doc.roleId?.toString() || doc.roleId || null,
      role: doc.roleId && doc.roleId.name ? { 
        id: doc.roleId._id.toString(), 
        name: doc.roleId.name, 
        permissions: doc.roleId.permissions,
        isSystemRole: doc.roleId.isSystemRole
      } : null,
      officeId: doc.officeId,
      status: doc.status
    });
  }

  async findByEmail(email) {
    const doc = await UserModel.findOne({ email }).populate('roleId').lean();
    return this.#mapToDomain(doc);
  }

  async findById(id) {
    const doc = await UserModel.findById(id).populate('roleId').lean();
    return this.#mapToDomain(doc);
  }

  async findAll() {
    const docs = await UserModel.find().populate('roleId').lean();
    return docs.map(doc => this.#mapToDomain(doc));
  }

  async save(user) {
    const doc = await UserModel.findOneAndUpdate(
      { email: user.email },
      {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        roleId: user.roleId || null,
        officeId: user.officeId,
        status: user.status
      },
      { new: true, upsert: true }
    ).populate('roleId').lean();
    return this.#mapToDomain(doc);
  }

  async update(id, data) {
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.roleId !== undefined) updateData.roleId = data.roleId || null;
    if (data.officeId !== undefined) updateData.officeId = data.officeId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.passwordHash !== undefined) updateData.passwordHash = data.passwordHash;

    const doc = await UserModel.findByIdAndUpdate(id, updateData, { new: true }).populate('roleId').lean();
    return this.#mapToDomain(doc);
  }

  async delete(id) {
    await UserModel.findByIdAndDelete(id);
    return true;
  }
}
