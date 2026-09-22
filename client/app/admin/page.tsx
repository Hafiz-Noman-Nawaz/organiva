'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  TrendingUp,
  Package,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const token = localStorage.getItem('organiva_admin_token');
    try {
      const res = await api.get('/admin/dashboard/stats', token || undefined);
      if (res.success) setStats(res.stats);
    } catch (e) {
      console.error('Failed to fetch dashboard stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#5B755D]">
            Organiva Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] tracking-tight mt-0.5">
            Storefront Overview
          </h1>
        </div>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#5B755D]/20 text-xs font-bold text-[#171A18] hover:bg-[#FAF8F5] transition-colors shadow-xs w-fit"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-[#5B755D]/15 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#7F8681]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-[#EBF1EB] text-[#5B755D] flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#171A18]">
            PKR {stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}
          </p>
          <span className="text-[11px] text-[#5B755D] font-medium block">
            From verified fulfilled orders
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#5B755D]/15 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#7F8681]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-[#EBF1EB] text-[#5B755D] flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#171A18]">
            {stats?.totalOrders || 0}
          </p>
          <span className="text-[11px] text-[#7F8681] block">
            COD: {stats?.codOrders || 0} • Online: {stats?.onlineOrders || 0}
          </span>
        </div>

        {/* Pending Fulfillment */}
        <div className="bg-white p-5 rounded-2xl border border-[#5B755D]/15 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#7F8681]">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Orders</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#171A18]">
            {stats?.pendingOrders || 0}
          </p>
          <span className="text-[11px] text-amber-600 font-medium block">
            Awaiting confirmation/dispatch
          </span>
        </div>

        {/* Delivered / Completed */}
        <div className="bg-white p-5 rounded-2xl border border-[#5B755D]/15 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[#7F8681]">
            <span className="text-xs font-bold uppercase tracking-wider">Delivered</span>
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#171A18]">
            {stats?.deliveredOrders || 0}
          </p>
          <span className="text-[11px] text-green-600 font-medium block">
            Successfully completed
          </span>
        </div>
      </div>

      {/* Real-Time Graphical Analytics Dashboard (1D to 2Y) */}
      <AnalyticsDashboard />

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/orders"
          className="bg-white p-6 rounded-2xl border border-[#5B755D]/15 shadow-xs hover:border-[#5B755D]/40 transition-all group flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-[#7F8681] uppercase font-bold">Fulfillment</span>
            <h4 className="text-base font-bold text-[#171A18] mt-1 group-hover:text-[#5B755D]">
              Manage Orders Pipeline →
            </h4>
            <p className="text-xs text-[#525B54] mt-1">Confirm, pack, ship, and add tracking</p>
          </div>
          <ArrowUpRight size={20} className="text-[#5B755D]" />
        </Link>

        <Link
          href="/admin/products"
          className="bg-white p-6 rounded-2xl border border-[#5B755D]/15 shadow-xs hover:border-[#5B755D]/40 transition-all group flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-[#7F8681] uppercase font-bold">Catalog</span>
            <h4 className="text-base font-bold text-[#171A18] mt-1 group-hover:text-[#5B755D]">
              Product CMS & Hero Switcher →
            </h4>
            <p className="text-xs text-[#525B54] mt-1">Update prices, stock, specs, and hero product</p>
          </div>
          <ArrowUpRight size={20} className="text-[#5B755D]" />
        </Link>

        <Link
          href="/admin/inventory"
          className="bg-white p-6 rounded-2xl border border-[#5B755D]/15 shadow-xs hover:border-[#5B755D]/40 transition-all group flex items-center justify-between"
        >
          <div>
            <span className="text-xs text-[#7F8681] uppercase font-bold">Confidential</span>
            <h4 className="text-base font-bold text-[#171A18] mt-1 group-hover:text-[#5B755D]">
              Suppliers & Cost Tracking →
            </h4>
            <p className="text-xs text-[#525B54] mt-1">Admin-only supplier margins & inventory alerts</p>
          </div>
          <ArrowUpRight size={20} className="text-[#5B755D]" />
        </Link>
      </div>

      {/* Recent Orders Preview */}
      <div className="bg-white rounded-3xl border border-[#5B755D]/15 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#5B755D]/10">
          <h3 className="text-base font-bold text-[#171A18]">Recent Store Orders</h3>
          <Link href="/admin/orders" className="text-xs font-bold text-[#5B755D] hover:underline">
            View All Orders
          </Link>
        </div>

        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#7F8681] border-b border-gray-100">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentOrders.map((o: any) => (
                  <tr key={o._id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 px-3 font-mono font-bold text-[#171A18]">{o.orderId}</td>
                    <td className="py-3 px-3 font-medium text-[#171A18]">{o.customer?.fullName}</td>
                    <td className="py-3 px-3 text-[#525B54]">{o.customer?.city}</td>
                    <td className="py-3 px-3 font-bold text-[#171A18]">PKR {o.total}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBF1EB] text-[#435845]">
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">
                        {o.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-[#7F8681] text-center py-6">No orders placed yet.</p>
        )}
      </div>
    </div>
  );
}
