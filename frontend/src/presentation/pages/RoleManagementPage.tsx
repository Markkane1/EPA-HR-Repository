import { useState, useEffect } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';
import { ALL_PERMISSIONS, PERMISSION_LABELS, Permission, Role } from '../../domain/entities';
import { Shield, Plus, Pencil, Trash2, Check, X, AlertTriangle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

// --------------- Confirmation Modal ---------------
const ConfirmModal = ({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-[scale-in_0.15s_ease-out]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">Confirm Deletion</h3>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
      </div>
      <div className="flex gap-2 justify-end mt-4">
        <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors">Delete</button>
      </div>
    </div>
  </div>
);

// --------------- Role Form ---------------
interface RoleFormProps {
  initial?: Partial<Role>;
  onSave: (data: { name: string; permissions: string[] }) => Promise<void>;
  onCancel: () => void;
}

const RoleForm = ({ initial, onSave, onCancel }: RoleFormProps) => {
  const [name, setName] = useState(initial?.name || '');
  const [perms, setPerms] = useState<Set<string>>(new Set(initial?.permissions || []));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggle = (p: string) => {
    setPerms(prev => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Role name is required'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({ name: name.trim(), permissions: Array.from(perms) });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to save role');
      setSaving(false);
    }
  };

  // Group permissions by category
  const grouped = ALL_PERMISSIONS.reduce((acc, p) => {
    const cat = p.split('.')[0];
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5 flex items-center gap-2">
          <X className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Role Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. HR Manager"
          disabled={initial?.isSystemRole}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
        />
        {initial?.isSystemRole && <p className="text-xs text-amber-600 mt-1">System roles cannot be renamed.</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Permissions</label>
        <div className="space-y-3">
          {Object.entries(grouped).map(([category, ps]) => (
            <div key={category} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{category}</span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {ps.map(p => (
                  <label key={p} className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors hover:bg-slate-50 ${perms.has(p) ? 'bg-blue-50' : ''}`}>
                    <div
                      onClick={() => toggle(p)}
                      className={`w-4.5 h-4.5 rounded flex items-center justify-center border-2 flex-shrink-0 cursor-pointer transition-all ${
                        perms.has(p) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {perms.has(p) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-slate-700 select-none" onClick={() => toggle(p)}>{PERMISSION_LABELS[p as Permission]}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 transition-colors disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Role'}
        </button>
      </div>
    </form>
  );
};

// --------------- Main Page ---------------
export const RoleManagementPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await apiService.getRoles();
      setRoles(data);
    } catch (err: any) {
      setError('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRoles(); }, []);

  const handleCreate = async (data: { name: string; permissions: string[] }) => {
    await apiService.createRole(data);
    setShowCreate(false);
    loadRoles();
  };

  const handleUpdate = async (data: { name: string; permissions: string[] }) => {
    if (!editingRole) return;
    await apiService.updateRole(editingRole.id, data);
    setEditingRole(null);
    loadRoles();
  };

  const handleDelete = async () => {
    if (!deletingRole) return;
    await apiService.deleteRole(deletingRole.id);
    setDeletingRole(null);
    loadRoles();
  };

  return (
    <div className="space-y-6">
      {deletingRole && (
        <ConfirmModal
          message={`Delete role "${deletingRole.name}"? Users assigned to this role will lose access.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingRole(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Role Management</h1>
            <p className="text-sm text-slate-500">Configure roles and their page/action permissions</p>
          </div>
        </div>
        <button
          onClick={() => { setShowCreate(true); setEditingRole(null); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Role
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" /> Create New Role
          </h2>
          <RoleForm onSave={handleCreate} onCancel={() => setShowCreate(false)} />
        </div>
      )}

      {/* Roles List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {roles.map(role => (
            <div key={role.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {editingRole?.id === role.id ? (
                <div className="p-6">
                  <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-blue-600" /> Editing: {role.name}
                  </h2>
                  <RoleForm initial={role} onSave={handleUpdate} onCancel={() => setEditingRole(null)} />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${role.isSystemRole ? 'bg-amber-100' : 'bg-blue-100'}`}>
                        <Shield className={`w-5 h-5 ${role.isSystemRole ? 'text-amber-600' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{role.name}</span>
                          {role.isSystemRole && (
                            <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full">System</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View permissions"
                      >
                        {expandedRole === role.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => { setEditingRole(role); setShowCreate(false); }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit role"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {!role.isSystemRole && (
                        <button
                          onClick={() => setDeletingRole(role)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {expandedRole === role.id && (
                    <div className="px-5 pb-4 border-t border-slate-100 pt-3">
                      {role.permissions.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">No permissions assigned</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.map(p => (
                            <span key={p} className="text-xs bg-blue-50 text-blue-700 font-medium px-2.5 py-1 rounded-lg border border-blue-100">
                              {PERMISSION_LABELS[p as Permission] || p}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          {roles.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No roles found</p>
              <p className="text-sm">Create your first role to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
