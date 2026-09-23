'use client';

import React, { useEffect, useState } from 'react';
import {
  Boxes,
  ShieldAlert,
  Plus,
  AlertCircle,
  Building2,
  Truck,
  DollarSign,
  Pencil,
  Trash2,
  X,
  Check,
  ExternalLink,
  Package,
} from 'lucide-react';
import { api } from '@/lib/api';

interface SupplierData {
  _id?: string;
  name: string;
  platform: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  supplierUrl?: string;
  paymentTerms?: string;
  notes?: string;
}

const INITIAL_SUPPLIER_FORM: SupplierData = {
  name: '',
  platform: 'Direct Manufacturer',
  contactPerson: '',
  email: '',
  phone: '',
  paymentTerms: 'Net 30',
  notes: '',
};

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Supplier modal & CRUD states
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SupplierData | null>(null);
  const [supplierForm, setSupplierForm] = useState<SupplierData>(INITIAL_SUPPLIER_FORM);
  const [savingSupplier, setSavingSupplier] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('organiva_admin_token');
    const rawUser = localStorage.getItem('organiva_admin_user');
    if (rawUser) {
      try {
        setAdminUser(JSON.parse(rawUser));
      } catch (e) {}
    }
    try {
      const [prodRes, supRes] = await Promise.all([
        api.get('/products/admin/all', token || undefined),
        api.get('/admin/suppliers', token || undefined),
      ]);
      if (prodRes.success) setProducts(prodRes.products || []);
      if (supRes.success) setSuppliers(supRes.suppliers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isSuper = adminUser?.isSuperAdmin || adminUser?.role === 'superadmin';
  const permissions: string[] = adminUser?.permissions || [];
  const canViewFinancials =
    isSuper ||
    permissions.includes('suppliers:manage') ||
    permissions.includes('analytics:view') ||
    permissions.includes('*');
  const canViewSuppliers =
    isSuper || permissions.includes('suppliers:manage') || permissions.includes('*');

  // Open modal for new supplier
  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setSupplierForm(INITIAL_SUPPLIER_FORM);
    setShowSupplierModal(true);
  };

  // Open modal to edit existing supplier
  const handleOpenEdit = (s: any) => {
    setEditingSupplier(s);
    setSupplierForm({
      _id: s._id,
      name: s.name || '',
      platform: s.platform || 'Direct Manufacturer',
      contactPerson: s.contactPerson || '',
      email: s.email || '',
      phone: s.phone || '',
      paymentTerms: s.paymentTerms || 'Net 30',
      notes: s.notes || '',
    });
    setShowSupplierModal(true);
  };

  // Save supplier (Create or Update)
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name.trim()) return;

    setSavingSupplier(true);
    const token = localStorage.getItem('organiva_admin_token');
    try {
      if (editingSupplier && editingSupplier._id) {
        const res = await api.put(
          `/admin/suppliers/${editingSupplier._id}`,
          supplierForm,
          token || undefined
        );
        if (res.success) {
          showToast('Supplier partner updated successfully.');
          setShowSupplierModal(false);
          fetchData();
        } else {
          alert(res.message || 'Failed to update supplier');
        }
      } else {
        const res = await api.post('/admin/suppliers', supplierForm, token || undefined);
        if (res.success) {
          showToast('New supplier partner registered successfully.');
          setShowSupplierModal(false);
          fetchData();
        } else {
          alert(res.message || 'Failed to create supplier');
        }
      }
    } catch (err: any) {
      alert(err.message || 'Network error saving supplier');
    } finally {
      setSavingSupplier(false);
    }
  };

  // Delete supplier
  const handleDeleteSupplier = async () => {
    if (!deleteTarget?._id) return;
    setDeletingSupplier(true);
    const token = localStorage.getItem('organiva_admin_token');
    try {
      const res = await api.delete(`/admin/suppliers/${deleteTarget._id}`, token || undefined);
      if (res.success) {
        showToast('Supplier partner removed.');
        setDeleteTarget(null);
        fetchData();
      } else {
        alert(res.message || 'Failed to delete supplier');
      }
    } catch (err: any) {
      alert(err.message || 'Network error deleting supplier');
    } finally {
      setDeletingSupplier(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#171A18] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Check size={16} className="text-[#8ED496]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#5B755D] bg-[#EBF1EB] px-2.5 py-1 rounded-full border border-[#5B755D]/20">
            Operations & Supply Chain
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] tracking-tight mt-1.5">
            Inventory & Supplier Cost Management
          </h1>
          <p className="text-xs sm:text-sm text-[#525B54] mt-1">
            Internal margins, procurement tracking, and supplier partner contacts.
          </p>
        </div>
        {canViewSuppliers && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5B755D] text-white text-xs font-bold hover:bg-[#485D4A] transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>Add Supplier Partner</span>
          </button>
        )}
      </div>

      {/* Inventory Margins Table */}
      <div className="bg-white rounded-3xl border border-[#5B755D]/15 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#5B755D]/10 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#171A18]">Inventory & Margin Breakdown</h3>
            <p className="text-xs text-[#525B54]">Live pricing, real landed cost, and gross margin per catalog SKU.</p>
          </div>
          <span className="text-xs text-[#7F8681] font-semibold bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-gray-200">
            PKR Currency
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#7F8681] border-b border-[#5B755D]/10">
              <tr>
                <th className="py-3 px-4 font-bold">SKU</th>
                <th className="py-3 px-4 font-bold">Product Name</th>
                <th className="py-3 px-4 font-bold">Stock</th>
                <th className="py-3 px-4 font-bold">Supplier Cost</th>
                <th className="py-3 px-4 font-bold">Selling Price</th>
                <th className="py-3 px-4 font-bold">Gross Margin</th>
                <th className="py-3 px-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Loading inventory data...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 max-w-sm mx-auto">
                      <div className="w-10 h-10 rounded-full bg-[#EBF1EB] text-[#5B755D] flex items-center justify-center">
                        <Package size={20} />
                      </div>
                      <p className="font-bold text-sm text-[#171A18]">No Products in Catalog Yet</p>
                      <p className="text-xs text-[#7F8681]">
                        When you publish real products in the Product CMS, their stock levels, landed costs, and margins will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const sell = p.salePrice || p.price;
                  const cost = p.costPrice || 0;
                  const margin = sell - cost;
                  const marginPct = sell > 0 ? Math.round((margin / sell) * 100) : 0;

                  return (
                    <tr key={p._id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#171A18]">{p.sku}</td>
                      <td className="py-3.5 px-4 font-bold text-[#171A18]">{p.title}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#5B755D]">{p.stock} units</td>
                      <td className="py-3.5 px-4 font-medium">
                        {canViewFinancials ? (
                          <span className="text-red-700 font-bold">PKR {cost.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-400 italic font-mono">[Restricted]</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#171A18]">PKR {sell.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        {canViewFinancials ? (
                          <span className="font-extrabold text-green-700">
                            PKR {margin.toLocaleString()} ({marginPct}%)
                          </span>
                        ) : (
                          <span className="text-gray-400 italic font-mono">[Restricted]</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBF1EB] text-[#435845]">
                          {p.stockStatus || 'IN_STOCK'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verified Supply Partners */}
      {canViewSuppliers ? (
        <div className="bg-white rounded-3xl border border-[#5B755D]/15 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#5B755D]/10 gap-3">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-[#5B755D]" />
              <h3 className="text-base font-bold text-[#171A18]">Verified Supply Partners</h3>
              <span className="text-xs bg-[#FAF8F5] text-[#525B54] px-2 py-0.5 rounded-full font-bold border border-gray-200">
                {suppliers.length}
              </span>
            </div>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#5B755D]/20 text-xs font-bold text-[#171A18] hover:bg-[#EBF1EB] transition-colors cursor-pointer w-fit"
            >
              <Plus size={13} />
              <span>Add Partner</span>
            </button>
          </div>

          {suppliers.length === 0 ? (
            <div className="p-10 text-center rounded-2xl border-2 border-dashed border-[#5B755D]/20 bg-[#FAF8F5]/60 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#EBF1EB] text-[#5B755D] flex items-center justify-center mx-auto">
                <Building2 size={22} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#171A18]">No Supply Partners Registered Yet</h4>
                <p className="text-xs text-[#7F8681] max-w-md mx-auto mt-1">
                  Keep track of your real manufacturers, wholesalers, sourcing agents, and escrow terms here.
                </p>
              </div>
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5B755D] text-white text-xs font-bold hover:bg-[#485D4A] transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Add First Supplier</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suppliers.map((s) => (
                <div
                  key={s._id}
                  className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#5B755D]/15 space-y-2.5 text-xs relative group hover:border-[#5B755D]/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-[#171A18]">{s.name}</h4>
                      <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-gray-200 inline-block mt-0.5">
                        {s.platform}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        title="Edit Supplier"
                        className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-[#5B755D] hover:border-[#5B755D]/30 transition-colors cursor-pointer"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(s)}
                        title="Delete Supplier"
                        className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-[#525B54]">
                    {s.contactPerson && (
                      <p>
                        Contact: <strong>{s.contactPerson}</strong>
                      </p>
                    )}
                    {s.email && (
                      <p className="text-[#7F8681]">
                        Email: <a href={`mailto:${s.email}`} className="text-[#5B755D] hover:underline">{s.email}</a>
                      </p>
                    )}
                    {s.phone && (
                      <p className="text-[#7F8681]">
                        Phone / WhatsApp: <strong>{s.phone}</strong>
                      </p>
                    )}
                    <p className="text-[#7F8681]">
                      Terms: <span className="font-semibold text-[#171A18]">{s.paymentTerms || 'Standard'}</span>
                    </p>
                  </div>

                  {s.notes && (
                    <p className="text-[11px] text-[#5B755D] bg-white p-2.5 rounded-xl border border-[#5B755D]/10">
                      <strong>Notes:</strong> {s.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#5B755D]/15 p-8 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert size={22} />
          </div>
          <h4 className="text-sm font-bold text-[#171A18]">Supply Agreements Hidden</h4>
          <p className="text-xs text-[#525B54] max-w-md mx-auto">
            Direct supplier agreements, contract terms, and manufacturing partners are restricted to authorized Admin accounts.
          </p>
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#5B755D]/20 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-[#5B755D]" />
                <h3 className="font-bold text-base text-[#171A18]">
                  {editingSupplier ? 'Edit Supply Partner' : 'Add Supply Partner'}
                </h3>
              </div>
              <button
                onClick={() => setShowSupplierModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#171A18] mb-1">Company / Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Industrial Supplies"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#5B755D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#171A18] mb-1">Sourcing Platform / Source</label>
                  <select
                    value={supplierForm.platform}
                    onChange={(e) => setSupplierForm({ ...supplierForm, platform: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#5B755D] bg-white"
                  >
                    <option value="Direct Manufacturer">Direct Manufacturer</option>
                    <option value="1688">1688</option>
                    <option value="Alibaba">Alibaba</option>
                    <option value="Yiwu Agent">Yiwu Agent</option>
                    <option value="Local Wholesaler">Local Wholesaler / Shah Alam</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#171A18] mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Mr. Tariq"
                    value={supplierForm.contactPerson || ''}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#5B755D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#171A18] mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="sales@company.com"
                    value={supplierForm.email || ''}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#5B755D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#171A18] mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+92 300 1234567"
                    value={supplierForm.phone || ''}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#5B755D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#171A18] mb-1">Payment & Contract Terms</label>
                <input
                  type="text"
                  placeholder="e.g. Net 30, 30% Advance, 70% BL, or COD"
                  value={supplierForm.paymentTerms || ''}
                  onChange={(e) => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#5B755D]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#171A18] mb-1">Notes / Procured Products</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Primary factory for acrylic organizers and drawer partitions."
                  value={supplierForm.notes || ''}
                  onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#5B755D]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-[#525B54] font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSupplier}
                  className="px-5 py-2 rounded-xl bg-[#5B755D] text-white font-bold hover:bg-[#485D4A] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingSupplier ? 'Saving...' : editingSupplier ? 'Update Partner' : 'Save Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-red-200 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <Trash2 size={20} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-[#171A18]">Delete Supplier Partner?</h3>
              <p className="text-xs text-[#525B54]">
                Are you sure you want to remove <strong>{deleteTarget.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#525B54] hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSupplier}
                disabled={deletingSupplier}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer disabled:opacity-50"
              >
                {deletingSupplier ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
