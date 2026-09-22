'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  UserPlus,
  Users,
  Lock,
  Mail,
  User as UserIcon,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Key,
  ShieldAlert,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { api } from '@/lib/api';

interface StaffUser {
  _id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'manager' | 'support' | 'inventory';
  isSuperAdmin: boolean;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'orders:view', label: 'View Orders', category: 'Orders' },
  { id: 'orders:manage', label: 'Update Status & Tracking', category: 'Orders' },
  { id: 'products:view', label: 'View Products & Details', category: 'Catalog' },
  { id: 'products:manage', label: 'Create & Edit Products', category: 'Catalog' },
  { id: 'products:delete', label: 'Delete Products', category: 'Catalog' },
  { id: 'inventory:view', label: 'View Stock Quantities', category: 'Inventory' },
  { id: 'inventory:manage', label: 'Adjust Warehouse Stock', category: 'Inventory' },
  { id: 'suppliers:manage', label: 'View Supplier Costs & Contacts', category: 'Financials' },
  { id: 'analytics:view', label: 'View Revenue & Profit Margins', category: 'Financials' },
];

export default function AdminStaffPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal State for New / Edit User
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'manager' as 'manager' | 'support' | 'inventory',
    permissions: ['orders:view', 'orders:manage', 'products:view'],
    isActive: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const rawUser = localStorage.getItem('organiva_admin_user');
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        setCurrentUser(u);
        if (!u.isSuperAdmin && u.role !== 'superadmin') {
          // Non-superadmin cannot access this panel
          router.replace('/admin');
          return;
        }
      } catch (e) {
        router.replace('/admin/login');
        return;
      }
    }
    fetchStaff();
  }, [router]);

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/auth/staff');
      if (res.success && res.staff) {
        setStaffList(res.staff);
      } else {
        setError(res.message || 'Failed to fetch staff members');
      }
    } catch (err: any) {
      setError(err.message || 'Could not load staff list');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingUserId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'manager',
      permissions: ['orders:view', 'orders:manage', 'products:view', 'inventory:view'],
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (staff: StaffUser) => {
    setEditingUserId(staff._id);
    setFormData({
      name: staff.name,
      email: staff.email,
      password: '', // blank unless updating
      role: (staff.role === 'superadmin' ? 'manager' : staff.role) as any,
      permissions: staff.permissions || [],
      isActive: staff.isActive,
    });
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permId: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permId);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== permId)
          : [...prev.permissions, permId],
      };
    });
  };

  const handleSelectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: AVAILABLE_PERMISSIONS.map((p) => p.id),
    }));
  };

  const handleClearPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: [],
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (editingUserId) {
        // Update existing staff
        const payload: any = {
          name: formData.name,
          role: formData.role,
          permissions: formData.permissions,
          isActive: formData.isActive,
        };
        if (formData.password.trim()) {
          payload.password = formData.password.trim();
        }

        const res = await api.put(`/auth/staff/${editingUserId}`, payload);
        if (res.success) {
          setActionSuccess(`Updated staff user ${formData.name} successfully.`);
          setIsModalOpen(false);
          fetchStaff();
        } else {
          setError(res.message || 'Update failed');
        }
      } else {
        // Create new staff
        if (!formData.password) {
          setError('Password is required for new staff member');
          setIsSaving(false);
          return;
        }

        const res = await api.post('/auth/staff', formData);
        if (res.success) {
          setActionSuccess(`Created staff user ${formData.name} successfully.`);
          setIsModalOpen(false);
          fetchStaff();
        } else {
          setError(res.message || 'Creation failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Server error processing staff user');
    } finally {
      setIsSaving(false);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const handleDeleteStaff = async (staff: StaffUser) => {
    if (staff.isSuperAdmin || staff.role === 'superadmin') {
      alert('Cannot delete master Super Admin account!');
      return;
    }

    if (!confirm(`Are you sure you want to permanently revoke and remove ${staff.name} (${staff.email})?`)) {
      return;
    }

    try {
      const res = await api.delete(`/auth/staff/${staff._id}`);
      if (res.success) {
        setActionSuccess(`Removed ${staff.name}`);
        fetchStaff();
      } else {
        setError(res.message || 'Failed to remove staff member');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete staff member');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#5B755D]/15 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF1EB] text-[#435845] text-xs font-bold uppercase tracking-wider mb-2 border border-[#5B755D]/20">
            <ShieldCheck size={14} className="text-[#5B755D]" />
            <span>Super Admin Exclusive</span>
          </div>
          <h1 className="text-2xl font-black text-[#171A18] tracking-tight">
            Staff & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-[#525B54] mt-1">
            Create employee accounts, assign passwords, and restrict visibility for suppliers, profits, and catalogs.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#5B755D] hover:bg-[#435845] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <UserPlus size={16} />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-[#5B755D]/15 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#5B755D]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[#5B755D]" />
            <h2 className="text-sm font-bold text-[#171A18]">Active Administrators & Staff Members</h2>
          </div>
          <span className="text-xs text-[#7F8681]">Total: {staffList.length}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#7F8681]">Loading staff directory...</div>
        ) : staffList.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#7F8681]">No staff accounts configured yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#5B755D]/10 bg-[#FAF8F5] text-[11px] font-bold text-[#525B54] uppercase tracking-wider">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Granted Permissions</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#5B755D]/10 text-xs">
                {staffList.map((staff) => {
                  const isSuper = staff.isSuperAdmin || staff.role === 'superadmin';
                  return (
                    <tr key={staff._id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#EBF1EB] text-[#435845] font-bold flex items-center justify-center text-xs border border-[#5B755D]/20">
                            {staff.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-[#171A18] flex items-center gap-1.5">
                              <span>{staff.name}</span>
                              {isSuper && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded border border-amber-300">
                                  Owner
                                </span>
                              )}
                            </div>
                            <span className="text-[#7F8681] text-[11px] block">{staff.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isSuper
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : staff.role === 'manager'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : staff.role === 'inventory'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {staff.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {staff.isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            <span>Suspended</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        {isSuper ? (
                          <span className="text-xs font-bold text-[#5B755D]">★ Full Master Privileges (Unrestricted)</span>
                        ) : staff.permissions && staff.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {staff.permissions.map((p) => (
                              <span
                                key={p}
                                className="text-[10px] bg-[#FAF8F5] border border-[#5B755D]/20 px-2 py-0.5 rounded text-[#2E332F]"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#A1ACA2] italic text-[11px]">No granular permissions assigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {!isSuper ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(staff)}
                              className="p-1.5 rounded-lg hover:bg-[#EBF1EB] text-[#5B755D] transition-colors"
                              title="Edit Permissions & Password"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(staff)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                              title="Delete / Revoke Staff Access"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#7F8681] italic">Protected Owner</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create or Edit Staff User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#5B755D]/20 space-y-5 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#5B755D]/15">
              <div>
                <h3 className="text-lg font-black text-[#171A18]">
                  {editingUserId ? 'Edit Staff Privileges' : 'Create New Staff Member'}
                </h3>
                <p className="text-xs text-[#525B54]">
                  {editingUserId
                    ? 'Adjust restrictions or change employee password'
                    : 'Assign a custom password and grant restricted module access'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#7F8681] hover:text-[#171A18]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171A18] mb-1">Employee Name</label>
                  <div className="relative">
                    <UserIcon size={15} className="absolute left-3.5 top-3 text-[#5B755D]" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Asad Ali"
                      className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl pl-10 pr-4 py-2 text-xs text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171A18] mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-3 text-[#5B755D]" />
                    <input
                      type="email"
                      required
                      disabled={!!editingUserId}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="asad@organiva.pk"
                      className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl pl-10 pr-4 py-2 text-xs text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25 disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171A18] mb-1">
                    {editingUserId ? 'Set New Password (optional)' : 'Assign Password'}
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-3 text-[#5B755D]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!editingUserId}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingUserId ? 'Leave blank to keep current' : 'Min 6 characters'}
                      className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl pl-10 pr-10 py-2 text-xs text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[#7F8681] hover:text-[#171A18]"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171A18] mb-1">Department Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full bg-[#FAF8F5] border border-[#5B755D]/20 rounded-xl px-3 py-2 text-xs text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/25"
                  >
                    <option value="manager">Operations Manager</option>
                    <option value="support">Customer Support Agent</option>
                    <option value="inventory">Inventory & Fulfillment Specialist</option>
                  </select>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#5B755D]/15">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#5B755D] rounded focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-bold text-[#171A18] cursor-pointer">
                  Account Enabled (Staff can log in)
                </label>
              </div>

              {/* Granular Restrictions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#171A18]">Granular Access Permissions:</span>
                  <div className="space-x-2 text-[11px]">
                    <button
                      type="button"
                      onClick={handleSelectAllPermissions}
                      className="text-[#5B755D] hover:underline font-semibold"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={handleClearPermissions}
                      className="text-red-500 hover:underline font-semibold"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-[#FAF8F5] rounded-xl border border-[#5B755D]/15 max-h-56 overflow-y-auto">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = formData.permissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-white border-[#5B755D]/40 text-[#171A18] font-medium shadow-2xs'
                            : 'border-transparent text-[#6B726C] hover:bg-white/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(perm.id)}
                          className="mt-0.5 rounded text-[#5B755D] focus:ring-0"
                        />
                        <div>
                          <span className="block text-[11px] font-bold">{perm.label}</span>
                          <span className="text-[10px] text-[#7F8681] font-mono">{perm.id}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[10px] text-[#7F8681] mt-1.5">
                  Tip: Deselect "View Supplier Costs & Contacts" or "View Revenue & Profit Margins" to hide sensitive purchase prices from fulfillment staff.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#5B755D]/15">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#525B54] hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#5B755D] hover:bg-[#435845] disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  {isSaving ? 'Saving...' : editingUserId ? 'Save Changes' : 'Create Staff User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
