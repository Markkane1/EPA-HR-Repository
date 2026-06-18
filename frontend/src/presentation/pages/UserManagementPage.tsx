import { useState, useEffect } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';
import { User, Role } from '../../domain/entities';
import { UserCog, Plus, Pencil, Trash2, Check, X, AlertTriangle, Loader2, Search, Shield, UserCheck, UserX } from 'lucide-react';

// --------------- Confirmation Modal ---------------
const ConfirmModal = ({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">Confirm Action</h3>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
      </div>
      <div className="flex gap-2 justify-end mt-4">
        <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors">Confirm</button>
      </div>
    </div>
  </div>
);

// --------------- User Form Modal ---------------
interface UserFormProps {
  initial?: Partial<User> & { password?: string };
  roles: Role[];
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
  isEdit?: boolean;
}

const UserFormModal = ({ initial, roles, onSave, onClose, isEdit }: UserFormProps) => {
  const [form, setForm] = useState({
    name: initial?.name || '',
    email: initial?.email || '',
    password: '',
    roleId: initial?.roleId || '',
    officeId: initial?.officeId || '',
    status: initial?.status || 'active',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required'); return; }
    if (!isEdit && !form.password.trim()) { setError('Password is required'); return; }
    setSaving(true);
    setError('');
    try {
      const payload: any = {
        name: form.name,
        email: form.email,
        roleId: form.roleId || null,
        officeId: form.officeId || null,
        status: form.status,
      };
      if (form.password) payload.password = form.password;
      await onSave(payload);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to save user');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800">{isEdit ? 'Edit User' : 'Create User'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-2.5 flex items-center gap-2 mb-4">
            <X className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Enter full name"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="user@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {isEdit ? 'Password (leave blank to keep unchanged)' : 'Password'}
            </label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder={isEdit ? '••••••••' : 'Min 8 characters'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign Role</label>
            <select value={form.roleId} onChange={e => set('roleId', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white transition-colors">
              <option value="">— No Role —</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white transition-colors">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 transition-colors disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? 'Saving...' : (isEdit ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --------------- Main Page ---------------
export const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        apiService.getUsers(),
        apiService.getRoles(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err: any) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (data: any) => {
    await apiService.createUser(data);
    setShowCreate(false);
    loadData();
  };

  const handleUpdate = async (data: any) => {
    if (!editingUser) return;
    await apiService.updateUser(editingUser.id, data);
    setEditingUser(null);
    loadData();
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    await apiService.deleteUser(deletingUser.id);
    setDeletingUser(null);
    loadData();
  };

  const filtered = users.filter(u => {
    const matchesSearch = !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !filterRole || u.roleId === filterRole;
    return matchesSearch && matchesRole;
  });

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarColors = ['from-blue-500 to-indigo-600', 'from-purple-500 to-pink-600', 'from-teal-500 to-emerald-600', 'from-orange-500 to-red-600'];
  const getColor = (id: string) => avatarColors[id.charCodeAt(0) % avatarColors.length];

  return (
    <div className="space-y-6">
      {deletingUser && (
        <ConfirmModal
          message={`Delete user "${deletingUser.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingUser(null)}
        />
      )}
      {showCreate && (
        <UserFormModal roles={roles} onSave={handleCreate} onClose={() => setShowCreate(false)} />
      )}
      {editingUser && (
        <UserFormModal initial={editingUser} roles={roles} onSave={handleUpdate} onClose={() => setEditingUser(null)} isEdit />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/30">
            <UserCog className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">User Management</h1>
            <p className="text-sm text-slate-500">Manage system users and assign roles</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-purple-500/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New User
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: users.length, color: 'text-slate-700', bg: 'bg-white' },
          { label: 'Active', value: users.filter(u => u.status === 'active').length, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Inactive', value: users.filter(u => u.status !== 'active').length, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl border border-slate-200 p-4 shadow-sm`}>
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors bg-white"
          />
        </div>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
        >
          <option value="">All Roles</option>
          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <UserCog className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No users found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getColor(user.id)} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white text-xs font-bold">{getInitials(user.name)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {user.role ? (
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-sm font-medium text-slate-700">{user.role.name}</span>
                          {user.role.isSystemRole && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">System</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">No role assigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {user.status === 'active' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
