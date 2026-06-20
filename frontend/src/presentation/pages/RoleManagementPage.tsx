import { useState, useEffect } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';
import { ALL_PERMISSIONS, PERMISSION_LABELS, Permission, Role } from '../../domain/entities';
import { PageHeader } from '../components/shared/PageHeader';
import { useDebounce } from '../hooks/useDebounce';

// --------------- Confirmation Modal ---------------
const ConfirmModal = ({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-white rounded-[0.35rem] shadow-2xl p-6 w-full max-w-sm mx-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <i className="fas fa-exclamation-triangle text-red-600"></i>
        </div>
        <div>
          <h3 className="font-bold text-[#5a5c69] mb-1">Confirm Deletion</h3>
          <p className="text-sm text-[#858796] mb-0">{message}</p>
        </div>
      </div>
      <div className="flex gap-2 justify-end mt-4">
        <button onClick={onCancel} className="px-4 py-2 text-sm rounded-[0.35rem] border border-[#e3e6f0] hover:bg-gray-50 text-[#858796] transition-colors">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-[0.35rem] bg-[#e74a3b] hover:bg-[#e02d1b] text-white font-bold transition-colors">Delete</button>
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
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-[0.35rem] px-4 py-2.5 flex items-center gap-2">
          <i className="fas fa-times-circle"></i>{error}
        </div>
      )}
      <div>
        <label className="block text-sm font-bold text-[#858796] mb-1.5">Role Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. HR Manager"
          disabled={initial?.isSystemRole}
          className="w-full h-[calc(1.5em+0.75rem+2px)] px-[0.75rem] py-[0.375rem] text-[1rem] font-normal text-[#6e707e] bg-white border border-[#d1d3e2] rounded-[0.35rem] outline-none focus:border-[#bac8f3] focus:ring focus:ring-[rgba(78,115,223,0.25)] transition-colors disabled:bg-gray-100"
        />
        {initial?.isSystemRole && <p className="text-xs text-[#f6c23e] mt-1 mb-0">System roles cannot be renamed.</p>}
      </div>

      <div>
        <label className="block text-sm font-bold text-[#858796] mb-2">Permissions</label>
        <div className="space-y-3">
          {Object.entries(grouped).map(([category, ps]) => (
            <div key={category} className="border border-[#e3e6f0] rounded-[0.35rem] overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-[#e3e6f0]">
                <span className="text-xs font-bold text-[#858796] uppercase tracking-wider">{category}</span>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ps.map(p => (
                  <label key={p} className={`flex items-center gap-2.5 p-2 rounded cursor-pointer transition-colors hover:bg-gray-50 ${perms.has(p) ? 'bg-blue-50' : ''}`}>
                    <div
                      onClick={() => toggle(p)}
                      className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 cursor-pointer transition-all ${
                        perms.has(p) ? 'bg-[#4e73df] border-[#4e73df]' : 'border-[#d1d3e2] bg-white'
                      }`}
                    >
                      {perms.has(p) && <i className="fas fa-check text-white text-[10px]"></i>}
                    </div>
                    <span className="text-sm text-[#5a5c69] select-none" onClick={() => toggle(p)}>{PERMISSION_LABELS[p as Permission]}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-3 border-t border-[#e3e6f0]">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-[0.35rem] border border-[#e3e6f0] text-[#858796] hover:bg-gray-50 font-bold transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-[0.35rem] bg-[#4e73df] hover:bg-[#2e59d9] text-white font-bold flex items-center gap-2 transition-colors disabled:opacity-60">
          {saving ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <i className="fas fa-check"></i>}
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
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

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

  const filteredRoles = roles.filter(role => 
    !debouncedSearch || role.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-6">
      {deletingRole && (
        <ConfirmModal
          message={`Delete role "${deletingRole.name}"? Users assigned to this role will lose access.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingRole(null)}
        />
      )}

      {/* Header */}
      <PageHeader 
        title="Role Management"
        actionButton={
          <button
            onClick={() => { setShowCreate(true); setEditingRole(null); }}
            className="inline-block px-3 py-1.5 text-sm font-normal text-white bg-[#4e73df] hover:bg-[#2e59d9] rounded-[0.35rem] shadow-sm transition-colors"
          >
            <i className="fas fa-plus fa-sm text-white/50 mr-1"></i> New Role
          </button>
        }
      />

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-[0.35rem] px-4 py-3">{error}</div>}

      {/* Search Input */}
      <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] mb-6">
        <div className="p-4">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858796]"><i className="fas fa-search"></i></span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search roles by name..."
              className="w-full pl-10 pr-4 py-1.5 text-sm bg-gray-100 border-0 rounded-[0.35rem] text-[#6e707e] outline-none focus:ring-0 focus:bg-white focus:border-[#bac8f3] focus:ring-[rgba(78,115,223,0.25)] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] mb-6">
          <div className="p-5 border-l-[0.25rem] border-[#4e73df]">
            <h2 className="text-lg font-bold text-[#4e73df] mb-4 flex items-center gap-2">
              <i className="fas fa-plus-circle"></i> Create New Role
            </h2>
            <RoleForm onSave={handleCreate} onCancel={() => setShowCreate(false)} />
          </div>
        </div>
      )}

      {/* Roles List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-[#4e73df] border-t-transparent rounded-full" role="status"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRoles.map(role => (
            <div key={role.id} className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] overflow-hidden">
              {editingRole?.id === role.id ? (
                <div className="p-5 border-l-[0.25rem] border-[#f6c23e]">
                  <h2 className="text-lg font-bold text-[#f6c23e] mb-4 flex items-center gap-2">
                    <i className="fas fa-edit"></i> Editing: {role.name}
                  </h2>
                  <RoleForm initial={role} onSave={handleUpdate} onCancel={() => setEditingRole(null)} />
                </div>
              ) : (
                <>
                  <div className={`flex items-center justify-between px-5 py-4 border-l-[0.25rem] ${role.isSystemRole ? 'border-[#f6c23e]' : 'border-[#4e73df]'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${role.isSystemRole ? 'bg-[#f6c23e]' : 'bg-[#4e73df]'}`}>
                        <i className="fas fa-shield-alt"></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#5a5c69]">{role.name}</span>
                          {role.isSystemRole && (
                            <span className="text-[0.65rem] bg-[#f6c23e] text-white font-bold px-2 py-0.5 rounded uppercase">System</span>
                          )}
                        </div>
                        <p className="text-sm text-[#858796] m-0">{role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                        className="p-2 text-[#858796] hover:text-[#4e73df] hover:bg-gray-100 rounded transition-colors"
                        title="View permissions"
                      >
                        <i className={`fas fa-chevron-${expandedRole === role.id ? 'up' : 'down'}`}></i>
                      </button>
                      <button
                        onClick={() => { setEditingRole(role); setShowCreate(false); }}
                        className="p-2 text-[#858796] hover:text-[#f6c23e] hover:bg-gray-100 rounded transition-colors"
                        title="Edit role"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      {!role.isSystemRole && (
                        <button
                          onClick={() => setDeletingRole(role)}
                          className="p-2 text-[#858796] hover:text-[#e74a3b] hover:bg-gray-100 rounded transition-colors"
                          title="Delete role"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  {expandedRole === role.id && (
                    <div className="px-5 pb-4 border-t border-[#e3e6f0] pt-3">
                      {role.permissions.length === 0 ? (
                        <p className="text-sm text-[#858796] italic m-0">No permissions assigned</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.map(p => (
                            <span key={p} className="text-xs bg-[#eaecf4] text-[#5a5c69] font-bold px-2.5 py-1 rounded">
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
          {filteredRoles.length === 0 && (
            <div className="text-center py-16 text-[#858796]">
              <i className="fas fa-shield-alt text-4xl mb-3 opacity-30"></i>
              <p className="font-bold">No roles found</p>
              <p className="text-sm">Create your first role to get started, or adjust your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
