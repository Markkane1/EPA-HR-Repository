import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: String }],
  isSystemRole: { type: Boolean, default: false }
}, { timestamps: true });

export const RoleModel = mongoose.model('Role', RoleSchema);
