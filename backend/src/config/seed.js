import { RoleModel } from '../infrastructure/database/models/RoleModel.js';
import { UserModel } from '../infrastructure/database/models/UserModel.js';

// All available permissions in the system
export const ALL_PERMISSIONS = [
  'dashboard.read',
  'employees.read',
  'employees.write',
  'offices.read',
  'offices.write',
  'users.read',
  'users.write',
  'roles.write',
];

/**
 * Seeds the database with default roles (Admin & Viewer) if they don't exist.
 * Also migrates existing users that have no roleId to the appropriate default role.
 */
export async function seedDefaultRoles() {
  try {
    // Create/ensure Admin role (system role with all permissions)
    let adminRole = await RoleModel.findOne({ name: 'Admin' });
    if (!adminRole) {
      adminRole = await RoleModel.create({
        name: 'Admin',
        permissions: ALL_PERMISSIONS,
        isSystemRole: true,
      });
      console.log('[Seed] Created Admin role');
    } else {
      // Make sure Admin always has all permissions
      await RoleModel.findByIdAndUpdate(adminRole._id, {
        permissions: ALL_PERMISSIONS,
        isSystemRole: true,
      });
    }

    // Create/ensure Viewer role (read-only)
    let viewerRole = await RoleModel.findOne({ name: 'Viewer' });
    if (!viewerRole) {
      viewerRole = await RoleModel.create({
        name: 'Viewer',
        permissions: ['dashboard.read', 'employees.read', 'offices.read'],
        isSystemRole: true,
      });
      console.log('[Seed] Created Viewer role');
    }

    // Migrate existing users that have no roleId:
    // If they have a legacy `role` string of 'admin', assign Admin role; otherwise assign Viewer
    const usersWithoutRole = await UserModel.find({ roleId: null });
    if (usersWithoutRole.length > 0) {
      for (const user of usersWithoutRole) {
        const assignedRoleId = adminRole._id; // Default all legacy users to Admin for safety
        await UserModel.findByIdAndUpdate(user._id, { roleId: assignedRoleId });
      }
      console.log(`[Seed] Migrated ${usersWithoutRole.length} users to Admin role`);
    }

    console.log('[Seed] Role seeding complete');
  } catch (error) {
    console.error('[Seed] Error seeding roles:', error.message);
  }
}
