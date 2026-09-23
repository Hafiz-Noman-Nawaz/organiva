'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Eye,
  MousePointer,
  ShoppingBag,
  DollarSign,
  Percent,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '@/lib/api';

type Period = '1D' | '3D' | '1W' | '1M' | '6M' | '1Y' | '2Y';
type MetricView = 'revenue' | 'purchases' | 'clicks' | 'impressions';

export const AnalyticsDashboard: React.FC = () => {
  const [period, setPeriod] = useState<Period>('1W');
  const [activeMetric, setActiveMetric] = useState<MetricView>('revenue');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const periods: { key: Period; label: string }[] = [
    { key: '1D', label: '1 Day' },
    { key: '3D', label: '3 Days' },
    { key: '1W', label: 'Weekly' },
    { key: '1M', label: 'Monthly' },
    { key: '6M', label: '6 Months' },
    { key: '1Y', label: '1 Year' },
    { key: '2Y', label: '2 Years' },
  ];

  const fetchAnalytics = async (selectedPeriod: Period) => {
    setLoading(true);
    const token = localStorage.getItem('organiva_admin_token');
    try {
      const res = await api.get(`/admin/dashboard/analytics?period=${selectedPeriod}`, token || undefined);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  const summary = data?.summary || {
    totalImpressions: 0,
    totalClicks: 0,
    totalPurchases: 0,
    totalRevenue: 0,
    conversionRate: 0,
    aov: 0,
  };

  const chart = data?.chart || {
    labels: [],
    impressions: [],
    clicks: [],
    purchases: [],
    revenue: [],
  };

  // Extract selected series
  const activeSeries: number[] = chart[activeMetric] || [];
  const actualPeak = activeSeries.length > 0 ? Math.max(...activeSeries) : 0;
  const maxVal = Math.max(actualPeak, 1);
  const minVal = 0;

  // Build SVG Points for smooth area curve
  const svgWidth = 700;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;

  const points = activeSeries.map((val, idx) => {
    const x = paddingX + (idx / Math.max(activeSeries.length - 1, 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - ((val - minVal) / (maxVal - minVal || 1)) * (svgHeight - paddingY * 2);
    return { x, y, val, label: chart.labels[idx] };
  });

  const pathD = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` +
      points
        .slice(1)
        .map((p, i) => {
          const prev = points[i];
          const cx = (prev.x + p.x) / 2;
          return `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
        })
        .join(' ')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
    : '';

  return (
    <div className="bg-white rounded-3xl border border-[#5B755D]/15 shadow-xs p-5 sm:p-7 space-y-6">
      {/* Header & Period Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#5B755D]/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5B755D] animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#5B755D]">
              Real-Time Store Telemetry
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#171A18] tracking-tight mt-0.5">
            Store Performance & Growth Matrix
          </h2>
          <p className="text-xs text-[#525B54]">
            Continuous funnel tracking from impressions & clicks to confirmed customer orders.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-2xl border border-[#5B755D]/15 overflow-x-auto self-start lg:self-auto max-w-full">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                period === p.key
                  ? 'bg-[#5B755D] text-white shadow-xs'
                  : 'text-[#525B54] hover:text-[#171A18] hover:bg-white/60'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Key Metric Cards with Active Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Impressions */}
        <div
          onClick={() => setActiveMetric('impressions')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeMetric === 'impressions'
              ? 'border-[#5B755D] bg-[#EBF1EB]/40 shadow-2xs'
              : 'border-gray-100 bg-[#FAF8F5]/60 hover:bg-[#FAF8F5]'
          }`}
        >
          <div className="flex items-center justify-between text-[#7F8681] mb-1">
            <span className="text-[11px] font-bold uppercase">Impressions</span>
            <Eye size={14} className={activeMetric === 'impressions' ? 'text-[#5B755D]' : ''} />
          </div>
          <div className="text-base sm:text-lg font-black text-[#171A18]">
            {summary.totalImpressions.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#5B755D] font-semibold">Store Visitors</span>
        </div>

        {/* Clicks */}
        <div
          onClick={() => setActiveMetric('clicks')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeMetric === 'clicks'
              ? 'border-[#5B755D] bg-[#EBF1EB]/40 shadow-2xs'
              : 'border-gray-100 bg-[#FAF8F5]/60 hover:bg-[#FAF8F5]'
          }`}
        >
          <div className="flex items-center justify-between text-[#7F8681] mb-1">
            <span className="text-[11px] font-bold uppercase">Clicks</span>
            <MousePointer size={14} className={activeMetric === 'clicks' ? 'text-[#5B755D]' : ''} />
          </div>
          <div className="text-base sm:text-lg font-black text-[#171A18]">
            {summary.totalClicks.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#5B755D] font-semibold">Product Views</span>
        </div>

        {/* Purchases */}
        <div
          onClick={() => setActiveMetric('purchases')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeMetric === 'purchases'
              ? 'border-[#5B755D] bg-[#EBF1EB]/40 shadow-2xs'
              : 'border-gray-100 bg-[#FAF8F5]/60 hover:bg-[#FAF8F5]'
          }`}
        >
          <div className="flex items-center justify-between text-[#7F8681] mb-1">
            <span className="text-[11px] font-bold uppercase">Purchases</span>
            <ShoppingBag size={14} className={activeMetric === 'purchases' ? 'text-[#5B755D]' : ''} />
          </div>
          <div className="text-base sm:text-lg font-black text-[#171A18]">
            {summary.totalPurchases.toLocaleString()}
          </div>
          <span className="text-[10px] text-green-600 font-semibold">Orders Placed</span>
        </div>

        {/* Gross Revenue */}
        <div
          onClick={() => setActiveMetric('revenue')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeMetric === 'revenue'
              ? 'border-[#5B755D] bg-[#EBF1EB]/40 shadow-2xs'
              : 'border-gray-100 bg-[#FAF8F5]/60 hover:bg-[#FAF8F5]'
          }`}
        >
          <div className="flex items-center justify-between text-[#7F8681] mb-1">
            <span className="text-[11px] font-bold uppercase">Gross Revenue</span>
            <DollarSign size={14} className={activeMetric === 'revenue' ? 'text-[#5B755D]' : ''} />
          </div>
          <div className="text-base sm:text-lg font-black text-[#171A18]">
            PKR {summary.totalRevenue.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#5B755D] font-semibold">Total PKR Sold</span>
        </div>

        {/* Conversion Rate */}
        <div className="p-3.5 rounded-2xl border border-gray-100 bg-[#FAF8F5]/60">
          <div className="flex items-center justify-between text-[#7F8681] mb-1">
            <span className="text-[11px] font-bold uppercase">Conversion</span>
            <Percent size={14} />
          </div>
          <div className="text-base sm:text-lg font-black text-[#171A18]">
            {summary.conversionRate}%
          </div>
          <span className="text-[10px] text-[#7F8681]">Clicks &rarr; Orders</span>
        </div>

        {/* AOV */}
        <div className="p-3.5 rounded-2xl border border-gray-100 bg-[#FAF8F5]/60">
          <div className="flex items-center justify-between text-[#7F8681] mb-1">
            <span className="text-[11px] font-bold uppercase">AOV</span>
            <Layers size={14} />
          </div>
          <div className="text-base sm:text-lg font-black text-[#171A18]">
            PKR {summary.aov.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#7F8681]">Avg. Basket Size</span>
        </div>
      </div>

      {/* Graphical Chart Container */}
      <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#5B755D]/15 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#171A18] uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp size={15} className="text-[#5B755D]" />
            <span>
              {activeMetric.toUpperCase()} TREND ({data?.periodName || period})
            </span>
          </span>
          <span className="text-xs font-bold text-[#5B755D]">
            Peak: {activeMetric === 'revenue' ? `PKR ${actualPeak.toLocaleString()}` : actualPeak.toLocaleString()}
          </span>
        </div>

        {/* Responsive Vector Chart */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-48 sm:h-56 select-none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="sageAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5B755D" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#5B755D" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Horizontal Guidelines */}
            {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = svgHeight - paddingY - ratio * (svgHeight - paddingY * 2);
              return (
                <line
                  key={i}
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="rgba(91, 117, 93, 0.12)"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Area Fill */}
            {points.length > 0 && <path d={areaD} fill="url(#sageAreaGrad)" />}

            {/* Line Path */}
            {points.length > 0 && (
              <path
                d={pathD}
                fill="none"
                stroke="#5B755D"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Points and Value Tags */}
            {points.map((pt, idx) => (
              <g key={idx} className="group cursor-pointer">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  fill="#FFFFFF"
                  stroke="#5B755D"
                  strokeWidth="2.5"
                  className="transition-transform group-hover:scale-150"
                />
                <text
                  x={pt.x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="#7F8681"
                  fontWeight="600"
                >
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Conversion Funnel Progress Bar */}
      <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#5B755D]/10 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[#171A18]">
          <span>Full Conversion Funnel Pipeline ({data?.periodName})</span>
          <span className="text-[#5B755D]">{summary.conversionRate}% Checkout Efficiency</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <div className="flex justify-between text-[11px] text-[#525B54] mb-1">
              <span>Top Funnel (Impressions)</span>
              <strong>{summary.totalImpressions > 0 ? '100%' : '0%'}</strong>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-[#5B755D] rounded-full transition-all"
                style={{ width: summary.totalImpressions > 0 ? '100%' : '0%' }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-[#525B54] mb-1">
              <span>Mid Funnel (Product Clicks)</span>
              <strong>
                {summary.totalImpressions > 0
                  ? `${((summary.totalClicks / summary.totalImpressions) * 100).toFixed(1)}%`
                  : '0.0%'}
              </strong>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-[#8EB892] rounded-full transition-all"
                style={{
                  width: `${
                    summary.totalImpressions > 0
                      ? Math.min(100, (summary.totalClicks / summary.totalImpressions) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-[#525B54] mb-1">
              <span>Bottom Funnel (Purchases)</span>
              <strong>{summary.conversionRate}%</strong>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-[#2E7D32] rounded-full transition-all"
                style={{
                  width: `${
                    summary.totalClicks > 0 || summary.totalImpressions > 0
                      ? Math.min(100, summary.conversionRate)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
