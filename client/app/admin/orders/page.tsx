'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Search, Eye, CheckCircle2, Truck, XCircle, AlertCircle, Phone, MapPin, Printer } from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Courier & Tracking State
  const [courierName, setCourierName] = useState('Trax Logistics');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [courierSuccessMsg, setCourierSuccessMsg] = useState(false);

  const getAutoTrackingUrl = (courier: string, cn: string) => {
    if (!cn) return '';
    const clean = cn.trim();
    if (courier.includes('Trax')) return `https://sonic.pk/tracking?cn=${clean}`;
    if (courier.includes('PostEx')) return `https://postex.pk/tracking?tracking_number=${clean}`;
    if (courier.includes('TCS')) return `https://www.tcsexpress.com/track/${clean}`;
    if (courier.includes('Leopards')) return `https://www.leopardscourier.com/tracking?track_id=${clean}`;
    if (courier.includes('Call Courier')) return `https://callcourier.com.pk/tracking/?tc=${clean}`;
    return '';
  };

  const handleSelectOrder = (o: any) => {
    setSelectedOrder(o);
    setCourierName(o.courierName || 'Trax Logistics');
    setTrackingNumber(o.trackingNumber || '');
    setTrackingUrl(o.trackingUrl || '');
    setEstimatedDeliveryDate(o.estimatedDeliveryDate || '');
    setCourierSuccessMsg(false);
  };

  const handlePrintAWB = (order: any) => {
    const printWindow = window.open('', '_blank', 'width=450,height=650');
    if (!printWindow) return;

    const itemsHtml = order.items
      ?.map(
        (it: any) => `
        <tr>
          <td style="padding: 4px 6px; border-bottom: 1px solid #ddd; font-size: 11px;">${it.title || 'Product'}</td>
          <td style="padding: 4px 6px; border-bottom: 1px solid #ddd; font-size: 11px; text-align: center;">${it.quantity}</td>
          <td style="padding: 4px 6px; border-bottom: 1px solid #ddd; font-size: 11px; text-align: right;">PKR ${it.total || it.price * it.quantity}</td>
        </tr>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>AWB - ${order.orderId}</title>
        <style>
          @page {
            size: 4in 6in;
            margin: 0.15in;
          }
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            margin: 0;
            padding: 8px;
            color: #000;
            background: #fff;
            font-size: 12px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 6px;
            margin-bottom: 8px;
          }
          .brand {
            font-size: 18px;
            font-weight: 900;
            letter-spacing: 2px;
            text-transform: uppercase;
          }
          .subbrand {
            font-size: 9px;
            letter-spacing: 1px;
            color: #444;
          }
          .barcode-box {
            text-align: center;
            margin: 8px 0;
            padding: 6px;
            border: 1px dashed #666;
            background: #fafafa;
          }
          .order-id {
            font-family: monospace;
            font-size: 16px;
            font-weight: 800;
            letter-spacing: 2px;
          }
          .courier-tag {
            font-size: 10px;
            font-weight: bold;
            display: inline-block;
            margin-top: 2px;
            padding: 2px 6px;
            background: #000;
            color: #fff;
            border-radius: 3px;
          }
          .section {
            border: 1px solid #000;
            margin-bottom: 8px;
            border-radius: 4px;
            overflow: hidden;
          }
          .section-title {
            background: #eee;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            padding: 3px 6px;
            border-bottom: 1px solid #ccc;
          }
          .section-body {
            padding: 6px;
            font-size: 11px;
            line-height: 1.35;
          }
          .cod-banner {
            background: #000;
            color: #fff;
            text-align: center;
            padding: 8px;
            border-radius: 4px;
            margin: 8px 0;
          }
          .cod-title {
            font-size: 10px;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .cod-amount {
            font-size: 20px;
            font-weight: 900;
            letter-spacing: 1px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          .footer {
            font-size: 9px;
            text-align: center;
            color: #555;
            margin-top: 8px;
            border-top: 1px solid #ddd;
            padding-top: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">ORGANIVA PAKISTAN</div>
          <div class="subbrand">SMART PRODUCTS. SIMPLER LIVING. | AIR WAYBILL (AWB)</div>
        </div>

        <div class="barcode-box">
          <div class="order-id">${order.orderId}</div>
          <div class="courier-tag">${order.courierName || 'EXPRESS COURIER'}${order.trackingNumber ? ' | CN: ' + order.trackingNumber : ''}</div>
        </div>

        <div class="section">
          <div class="section-title">DELIVERY DESTINATION (CONSIGNEE)</div>
          <div class="section-body">
            <strong>${order.customer?.fullName || 'Valued Customer'}</strong><br/>
            <strong>Phone:</strong> ${order.customer?.phone || 'N/A'}<br/>
            <strong>Address:</strong> ${order.customer?.address || ''}${order.customer?.area ? ', ' + order.customer.area : ''}<br/>
            <strong>City:</strong> ${order.customer?.city || 'Pakistan'}
          </div>
        </div>

        <div class="cod-banner">
          <div class="cod-title">${order.paymentMethod === 'COD' ? 'CASH ON DELIVERY (COLLECT FROM CUSTOMER)' : 'PREPAID ORDER - DO NOT COLLECT CASH'}</div>
          <div class="cod-amount">${order.paymentMethod === 'COD' ? 'PKR ' + order.total : 'PAID (PKR 0)'}</div>
        </div>

        <div class="section">
          <div class="section-title">PACKAGE CONTENTS (${order.items?.length || 0} ITEMS)</div>
          <table>
            <thead>
              <tr style="background: #f5f5f5; font-size: 10px;">
                <th style="padding: 3px 6px; text-align: left;">Item</th>
                <th style="padding: 3px 6px; text-align: center; width: 35px;">Qty</th>
                <th style="padding: 3px 6px; text-align: right; width: 65px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">SHIPPER (RETURN ADDRESS)</div>
          <div class="section-body" style="font-size: 10px;">
            <strong>Organiva Pakistan Central Fulfillment</strong><br/>
            DHA Phase 5 Commercial, Lahore, Pakistan<br/>
            Helpline / WhatsApp: +92 315 6251281 | organiva.tidy@gmail.com
          </div>
        </div>

        <div class="footer">
          ⚠️ FRAGILE / HANDLE WITH CARE • DO NOT BEND • ALLOW CUSTOMER TO VERIFY EXTERNAL FLYER SEAL
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveCourier = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    const token = localStorage.getItem('organiva_admin_token');
    const autoUrl = trackingUrl || getAutoTrackingUrl(courierName, trackingNumber);
    try {
      const res = await api.put(
        `/orders/admin/${selectedOrder._id}/status`,
        {
          courierName,
          trackingNumber,
          trackingUrl: autoUrl,
          estimatedDeliveryDate,
          comment: `Dispatched via ${courierName} (Tracking #${trackingNumber || 'N/A'})`,
        },
        token || undefined
      );
      if (res.success) {
        setSelectedOrder(res.order);
        setCourierSuccessMsg(true);
        fetchOrders();
        setTimeout(() => setCourierSuccessMsg(false), 4000);
      }
    } catch (e) {
      console.error('Failed to save courier info', e);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    const token = localStorage.getItem('organiva_admin_token');
    try {
      let url = '/orders/admin/all?';
      if (statusFilter !== 'ALL') url += `status=${statusFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const res = await api.get(url, token || undefined);
      if (res.success) setOrders(res.orders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setActionLoading(true);
    const token = localStorage.getItem('organiva_admin_token');
    try {
      const res = await api.put(
        `/orders/admin/${orderId}/status`,
        { orderStatus: newStatus, comment: `Status transitioned to ${newStatus}` },
        token || undefined
      );
      if (res.success) {
        setSelectedOrder(res.order);
        fetchOrders();
      }
    } catch (e) {
      console.error('Failed to update status', e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#5B755D]">
            Fulfillment
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] tracking-tight mt-0.5">
            Orders Pipeline
          </h1>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#5B755D]/20 rounded-xl px-3 py-2 text-xs font-semibold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLACED">Placed</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white rounded-3xl border border-[#5B755D]/15 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#7F8681] border-b border-[#5B755D]/10">
              <tr>
                <th className="py-3 px-4 font-bold">Order ID</th>
                <th className="py-3 px-4 font-bold">Date</th>
                <th className="py-3 px-4 font-bold">Customer</th>
                <th className="py-3 px-4 font-bold">City</th>
                <th className="py-3 px-4 font-bold">Total</th>
                <th className="py-3 px-4 font-bold">Method</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#171A18]">{o.orderId}</td>
                    <td className="py-3 px-4 text-[#7F8681]">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#171A18] block">{o.customer?.fullName}</span>
                      <span className="text-[11px] text-[#7F8681]">{o.customer?.phone}</span>
                    </td>
                    <td className="py-3 px-4 text-[#525B54]">{o.customer?.city}</td>
                    <td className="py-3 px-4 font-extrabold text-[#171A18]">PKR {o.total}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBF1EB] text-[#435845]">
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.orderStatus === 'DELIVERED'
                            ? 'bg-green-50 text-green-700'
                            : o.orderStatus === 'CANCELLED'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlePrintAWB(o)}
                          title="Print 4x6 Thermal AWB / Invoice"
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs transition-colors border border-gray-200 cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Printer size={13} className="text-[#5B755D]" />
                          <span className="hidden sm:inline">AWB</span>
                        </button>
                        <button
                          onClick={() => handleSelectOrder(o)}
                          className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#EBF1EB] text-[#5B755D] font-bold text-xs transition-colors border border-[#5B755D]/20 cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye size={13} />
                          <span>Manage</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#5B755D]/20 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#5B755D]/15">
              <div>
                <span className="text-xs font-mono text-[#7F8681]">ORDER DETAILS</span>
                <h3 className="text-xl font-extrabold font-mono text-[#171A18]">
                  {selectedOrder.orderId}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintAWB(selectedOrder)}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EBF1EB] text-[#1F3524] font-bold text-xs border border-[#5B755D]/20 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Printer size={14} className="text-[#5B755D]" />
                  <span>Print 4x6 AWB</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quick Status Action Controls */}
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#5B755D]/15 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#171A18] block">
                Update Order Status:
              </span>
              <div className="flex flex-wrap gap-2">
                {['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(
                  (status) => (
                    <button
                      key={status}
                      disabled={actionLoading || selectedOrder.orderStatus === status}
                      onClick={() => handleUpdateStatus(selectedOrder._id, status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedOrder.orderStatus === status
                          ? 'bg-[#5B755D] text-white shadow-xs'
                          : 'bg-white text-[#2E332F] hover:bg-[#EBF1EB] border border-[#5B755D]/20'
                      }`}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Courier Dispatch & Real-Time Tracking */}
            <div className="p-4 bg-white rounded-2xl border border-[#5B755D]/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#171A18] flex items-center gap-1.5">
                  <Truck size={14} className="text-[#5B755D]" />
                  Courier Dispatch & Real-Time Tracking
                </span>
                {courierSuccessMsg && (
                  <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    Saved & Updated!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#525B54] mb-1">
                    Courier Partner (Pakistan)
                  </label>
                  <select
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/20"
                  >
                    <option value="Trax Logistics">Trax Logistics</option>
                    <option value="PostEx">PostEx</option>
                    <option value="TCS Express">TCS Express</option>
                    <option value="Leopards Courier">Leopards Courier</option>
                    <option value="Call Courier">Call Courier</option>
                    <option value="M&P Express">M&P Express</option>
                    <option value="Direct Supplier Tracking">Direct Supplier / Dropshipper Tracking</option>
                    <option value="In-house / Local Rider">In-house / Local Rider</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#525B54] mb-1">
                    Supplier Tracking / Consignment CN #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TRX-9823412 or Supplier CN"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#525B54] mb-1">
                    Supplier Tracking URL (Optional - leave blank to auto-link Trax/PostEx/TCS)
                  </label>
                  <input
                    type="url"
                    placeholder="https://17track.net/en/track?nums=... or supplier portal link"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-gray-200 rounded-xl px-3 py-2 text-xs text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#5B755D]/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#7F8681]">
                  Customers can track this CN # on /track-order and view the live courier status.
                </span>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleSaveCourier}
                  className="px-4 py-2 rounded-xl bg-[#5B755D] hover:bg-[#435845] disabled:opacity-50 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : 'Save Tracking Info'}
                </button>
              </div>
            </div>

            {/* Customer & Shipping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-white rounded-2xl border border-gray-100 space-y-1">
                <span className="font-bold text-[#7F8681] uppercase block text-[10px]">Customer Info</span>
                <p className="font-bold text-sm text-[#171A18]">{selectedOrder.customer?.fullName}</p>
                <p className="text-[#525B54] flex items-center gap-1.5">
                  <Phone size={12} className="text-[#5B755D]" />
                  {selectedOrder.customer?.phone}
                </p>
                {selectedOrder.customer?.email && (
                  <p className="text-[#7F8681]">{selectedOrder.customer.email}</p>
                )}
              </div>

              <div className="p-4 bg-white rounded-2xl border border-gray-100 space-y-1">
                <span className="font-bold text-[#7F8681] uppercase block text-[10px]">Delivery Address</span>
                <p className="font-bold text-[#171A18]">{selectedOrder.customer?.city}</p>
                <p className="text-[#525B54]">{selectedOrder.customer?.address}</p>
                {selectedOrder.customer?.area && (
                  <p className="text-[#7F8681]">Area: {selectedOrder.customer.area}</p>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#171A18]">
                Ordered Items
              </span>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                {selectedOrder.items?.map((item: any, i: number) => (
                  <div key={i} className="p-3 bg-white flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#171A18] block">{item.title}</span>
                      <span className="text-[#7F8681]">SKU: {item.sku} • Qty: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-[#171A18]">PKR {item.total}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm font-bold">
              <span>Total Bill ({selectedOrder.paymentMethod}):</span>
              <span className="text-base text-[#5B755D]">PKR {selectedOrder.total}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
