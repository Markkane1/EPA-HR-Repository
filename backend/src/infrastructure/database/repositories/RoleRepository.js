import { IRoleRepository } from '../../../domain/repositories/IRoleRepository.js';
import { RoleModel } from '../models/RoleModel.js';
import { Role } from '../../../domain/entities/Role.js';

export class RoleRepository extends IRoleRepository {
  _mapToDomain(doc) {
    if (!doc) return null;
    return Role.create({
      id: doc.id || doc._id.toString(),
      name: doc.name,
      permissions: doc.permissions,
      isSystemRole: doc.isSystemRole
    });
  }

  async findAll() {
    const docs = await RoleModel.find().lean();
    return docs.map(doc => this._mapToDomain(doc));
  }

  async findById(id) {
    const doc = await RoleModel.findById(id).lean();
    return this._mapToDomain(doc);
  }

  async findByName(name) {
    const doc = await RoleModel.findOne({ name }).lean();
    return this._mapToDomain(doc);
  }

  async save(role) {
    const doc = new RoleModel(role);
    await doc.save();
    return this._mapToDomain(doc.toObject());
  }

  async update(id, data) {
    const doc = await RoleModel.findByIdAndUpdate(id, data, { new: true }).lean();
    return this._mapToDomain(doc);
  }

  async delete(id) {
    const doc = await RoleModel.findById(id);
    if (doc?.isSystemRole) {
      throw new Error("System roles cannot be deleted.");
    }
    await RoleModel.findByIdAndDelete(id);
    return true;
  }
}
