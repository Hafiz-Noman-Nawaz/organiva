'use client';

import React, { useEffect, useState } from 'react';
import { Boxes, ShieldAlert, Plus, AlertCircle, Building2, Truck, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

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
  const canViewFinancials = isSuper || permissions.includes('suppliers:manage') || permissions.includes('analytics:view') || permissions.includes('*');
  const canViewSuppliers = isSuper || permissions.includes('suppliers:manage') || permissions.includes('*');

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
          Admin Confidential
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] tracking-tight mt-1">
          Inventory & Supplier Cost Management
        </h1>
        <p className="text-xs sm:text-sm text-[#525B54] mt-1">
          Internal margins, supplier platform tracking, and reorder levels. Protected by role-based access control.
        </p>
      </div>

      {/* Inventory Margins Table */}
      <div className="bg-white rounded-3xl border border-[#5B755D]/15 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#5B755D]/10 flex items-center justify-between">
          <h3 className="text-base font-bold text-[#171A18]">Inventory & Margin Breakdown</h3>
          <span className="text-xs text-[#7F8681]">PKR Currency</span>
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
              ) : products.map((p) => {
                const sell = p.salePrice || p.price;
                const cost = p.costPrice || 0;
                const margin = sell - cost;
                const marginPct = sell > 0 ? Math.round((margin / sell) * 100) : 0;

                return (
                  <tr key={p._id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 px-4 font-mono font-bold text-[#171A18]">{p.sku}</td>
                    <td className="py-3 px-4 font-bold text-[#171A18]">{p.title}</td>
                    <td className="py-3 px-4 font-semibold text-[#5B755D]">{p.stock} units</td>
                    <td className="py-3 px-4 font-medium">
                      {canViewFinancials ? (
                        <span className="text-red-700 font-bold">PKR {cost}</span>
                      ) : (
                        <span className="text-gray-400 italic font-mono">[Restricted]</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#171A18]">PKR {sell}</td>
                    <td className="py-3 px-4">
                      {canViewFinancials ? (
                        <span className="font-extrabold text-green-700">
                          PKR {margin} ({marginPct}%)
                        </span>
                      ) : (
                        <span className="text-gray-400 italic font-mono">[Restricted]</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBF1EB] text-[#435845]">
                        {p.stockStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confidential Suppliers Table */}
      {canViewSuppliers ? (
        <div className="bg-white rounded-3xl border border-[#5B755D]/15 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#5B755D]/10">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-[#5B755D]" />
              <h3 className="text-base font-bold text-[#171A18]">Verified Supply Partners</h3>
            </div>
            <span className="text-xs text-[#7F8681]">Confidential</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map((s) => (
              <div
                key={s._id}
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#5B755D]/15 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#171A18]">{s.name}</h4>
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-gray-200">
                    {s.platform}
                  </span>
                </div>
                <p className="text-[#525B54]">Contact: <strong>{s.contactPerson || 'N/A'}</strong> ({s.email})</p>
                <p className="text-[#7F8681]">Terms: {s.paymentTerms || 'Standard'}</p>
                {s.notes && (
                  <p className="text-[11px] text-[#5B755D] bg-white p-2 rounded-xl border border-[#5B755D]/10">
                    Note: {s.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#5B755D]/15 p-8 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <ShieldAlert size={22} />
          </div>
          <h4 className="text-sm font-bold text-[#171A18]">Supply Agreements Hidden</h4>
          <p className="text-xs text-[#525B54] max-w-md mx-auto">
            Direct supplier agreements, contract terms, and manufacturing partners are restricted to Super Admin accounts.
          </p>
        </div>
      )}
    </div>
  );
}
