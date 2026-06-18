/**
 * Dynamic permission-based authorization middleware.
 * Usage: authorize('employees.write') or authorize(['employees.write', 'offices.read'])
 * If no permission is required, it just checks that the user is authenticated (via req.user).
 */
export const authorize = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ error: 'Forbidden: Not authenticated' });
    }

    // Super admin (isSystemRole admin) bypasses all permission checks
    if (req.user.isSystemAdmin) {
      return next();
    }

    if (!requiredPermission) {
      return next();
    }

    const permissions = req.user.permissions || [];
    const required = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];

    const hasPermission = required.some(p => permissions.includes(p));
    if (!hasPermission) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }

    next();
  };
};
