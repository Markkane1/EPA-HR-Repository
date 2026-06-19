import { useState, useEffect } from 'react';
import { apiService } from '../../infrastructure/api/ApiService';
import { User, Role } from '../../domain/entities';

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
          <h3 className="font-bold text-[#5a5c69] mb-1">Confirm Action</h3>
          <p className="text-sm text-[#858796] mb-0">{message}</p>
        </div>
      </div>
      <div className="flex gap-2 justify-end mt-4">
        <button onClick={onCancel} className="px-4 py-2 text-sm rounded-[0.35rem] border border-[#e3e6f0] hover:bg-gray-50 text-[#858796] transition-colors">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-[0.35rem] bg-[#e74a3b] hover:bg-[#e02d1b] text-white font-bold transition-colors">Confirm</button>
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
      <div className="relative bg-white rounded-[0.35rem] shadow-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#5a5c69] m-0">{isEdit ? 'Edit User' : 'Create User'}</h2>
          <button onClick={onClose} className="text-[#858796] hover:text-[#5a5c69] transition-colors"><i className="fas fa-times"></i></button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-[0.35rem] px-4 py-2.5 flex items-center gap-2 mb-4">
            <i className="fas fa-times-circle"></i>{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#858796] mb-1.5">Full Name</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Enter full name"
              className="w-full h-[calc(1.5em+0.75rem+2px)] px-[0.75rem] py-[0.375rem] text-[1rem] font-normal text-[#6e707e] bg-white border border-[#d1d3e2] rounded-[0.35rem] outline-none focus:border-[#bac8f3] focus:ring focus:ring-[rgba(78,115,223,0.25)] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#858796] mb-1.5">Email Address</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="user@example.com"
              className="w-full h-[calc(1.5em+0.75rem+2px)] px-[0.75rem] py-[0.375rem] text-[1rem] font-normal text-[#6e707e] bg-white border border-[#d1d3e2] rounded-[0.35rem] outline-none focus:border-[#bac8f3] focus:ring focus:ring-[rgba(78,115,223,0.25)] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#858796] mb-1.5">
              {isEdit ? 'Password (leave blank to keep unchanged)' : 'Password'}
            </label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder={isEdit ? '••••••••' : 'Min 8 characters'}
              className="w-full h-[calc(1.5em+0.75rem+2px)] px-[0.75rem] py-[0.375rem] text-[1rem] font-normal text-[#6e707e] bg-white border border-[#d1d3e2] rounded-[0.35rem] outline-none focus:border-[#bac8f3] focus:ring focus:ring-[rgba(78,115,223,0.25)] transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#858796] mb-1.5">Assign Role</label>
            <select value={form.roleId} onChange={e => set('roleId', e.target.value)}
              className="w-full h-[calc(1.5em+0.75rem+2px)] px-[0.75rem] py-[0.375rem] text-[1rem] font-normal text-[#6e707e] bg-white border border-[#d1d3e2] rounded-[0.35rem] outline-none focus:border-[#bac8f3] focus:ring focus:ring-[rgba(78,115,223,0.25)] transition-colors">
              <option value="">— No Role —</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#858796] mb-1.5">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full h-[calc(1.5em+0.75rem+2px)] px-[0.75rem] py-[0.375rem] text-[1rem] font-normal text-[#6e707e] bg-white border border-[#d1d3e2] rounded-[0.35rem] outline-none focus:border-[#bac8f3] focus:ring focus:ring-[rgba(78,115,223,0.25)] transition-colors">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t border-[#e3e6f0]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-[0.35rem] border border-[#e3e6f0] text-[#858796] hover:bg-gray-50 font-bold transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-[0.35rem] bg-[#4e73df] hover:bg-[#2e59d9] text-white font-bold flex items-center gap-2 transition-colors disabled:opacity-60">
              {saving ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <i className="fas fa-check"></i>}
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

  return (
    <div className="space-y-6 pb-6">
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl text-gray-800 font-normal m-0">User Management</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-block px-3 py-1.5 text-sm font-normal text-white bg-[#4e73df] hover:bg-[#2e59d9] rounded-[0.35rem] shadow-sm transition-colors"
        >
          <i className="fas fa-plus fa-sm text-white/50 mr-1"></i> New User
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-[#e74a3b] text-sm rounded-[0.35rem] px-4 py-3">{error}</div>}

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[
          { label: 'Total Users', value: users.length, border: 'border-l-[0.25rem] border-[#4e73df]', text: 'text-[#4e73df]' },
          { label: 'Active', value: users.filter(u => u.status === 'active').length, border: 'border-l-[0.25rem] border-[#1cc88a]', text: 'text-[#1cc88a]' },
          { label: 'Inactive', value: users.filter(u => u.status !== 'active').length, border: 'border-l-[0.25rem] border-[#e74a3b]', text: 'text-[#e74a3b]' },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] p-4 ${s.border}`}>
            <div className="text-[0.7rem] font-bold uppercase mb-1 text-[#858796]">{s.label}</div>
            <div className={`text-xl font-bold ${s.text}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] mb-6">
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858796]"><i className="fas fa-search"></i></span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-1.5 text-sm bg-gray-100 border-0 rounded-[0.35rem] text-[#6e707e] outline-none focus:ring-0 focus:bg-white focus:border-[#bac8f3] focus:ring-[rgba(78,115,223,0.25)] transition-colors"
              />
            </div>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="px-4 py-1.5 text-sm bg-gray-100 border-0 rounded-[0.35rem] text-[#6e707e] outline-none focus:ring-0 focus:bg-white focus:border-[#bac8f3] focus:ring-[rgba(78,115,223,0.25)] transition-colors"
            >
              <option value="">All Roles</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-[#4e73df] border-t-transparent rounded-full" role="status"></div>
        </div>
      ) : (
        <div className="bg-white rounded-[0.35rem] shadow-[0_0.15rem_1.75rem_0_rgba(58,59,69,0.15)] overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-[#858796]">
              <i className="fas fa-users text-4xl mb-3 opacity-30"></i>
              <p className="font-bold mb-1">No users found</p>
              <p className="text-sm m-0">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e3e6f0] bg-gray-50">
                    <th className="px-5 py-3 text-xs font-bold text-[#858796] uppercase tracking-wider">User</th>
                    <th className="px-5 py-3 text-xs font-bold text-[#858796] uppercase tracking-wider">Role</th>
                    <th className="px-5 py-3 text-xs font-bold text-[#858796] uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-right text-xs font-bold text-[#858796] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3e6f0]">
                  {filtered.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-[#4e73df] flex items-center justify-center flex-shrink-0 text-white font-bold`}>
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <p className="font-bold text-[#5a5c69] m-0">{user.name}</p>
                            <p className="text-sm text-[#858796] m-0">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {user.role ? (
                          <div className="flex items-center gap-1.5">
                            <i className="fas fa-shield-alt text-[#36b9cc]"></i>
                            <span className="text-sm font-bold text-[#5a5c69]">{user.role.name}</span>
                            {user.role.isSystemRole && (
                              <span className="text-[0.65rem] bg-[#f6c23e] text-white px-2 py-0.5 rounded uppercase font-bold">System</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-[#858796] italic">No role assigned</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full text-white ${
                          user.status === 'active' ? 'bg-[#1cc88a]' : 'bg-[#e74a3b]'
                        }`}>
                          <i className={`fas fa-${user.status === 'active' ? 'check' : 'times'}`}></i>
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="inline-block px-2 py-1 text-sm bg-[#f8f9fc] hover:bg-[#e2e6ea] text-[#4e73df] rounded transition-colors mr-2"
                          title="Edit user"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="inline-block px-2 py-1 text-sm bg-red-50 hover:bg-red-100 text-[#e74a3b] rounded transition-colors"
                          title="Delete user"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
