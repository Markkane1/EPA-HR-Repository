/**
 * Dynamic permission-based authorization middleware.
 * Usage: authorize('employees.write') or authorize(['employees.write', 'offices.read'])
 * Backward-compatible: also accepts old JWTs where role === 'admin'.
 */
export const authorize = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ error: 'Forbidden: Not authenticated' });
    }

    // Backward compat: old JWTs have role === 'admin' string
    const isLegacyAdmin = req.user.role === 'admin';

    // New JWTs: isSystemAdmin flag set for system roles
    const isSystemAdmin = req.user.isSystemAdmin === true;

    // Both legacy admins and system admins bypass all permission checks
    if (isLegacyAdmin || isSystemAdmin) {
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

