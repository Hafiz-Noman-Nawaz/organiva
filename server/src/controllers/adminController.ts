import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Supplier } from '../models/Inventory';
import { ShippingRule } from '../models/ShippingRule';
import { Telemetry } from '../models/Telemetry';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ paymentStatus: 'PAID' });
    const pendingOrders = await Order.countDocuments({ orderStatus: 'PLACED' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'DELIVERED' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'CANCELLED' });

    const codOrders = await Order.countDocuments({ paymentMethod: 'COD' });
    const onlineOrders = await Order.countDocuments({ paymentMethod: { $in: ['JAZZCASH', 'EASYPAISA'] } });

    // Revenue calculation from non-cancelled orders
    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'CANCELLED' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
    ]);

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Top selling products
    const topProductsAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'CANCELLED' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.title',
          totalUnitsSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
        },
      },
      { $sort: { totalUnitsSold: -1 } },
      { $limit: 5 },
    ]);

    // Recent orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).lean();

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        paidOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        codOrders,
        onlineOrders,
        topProducts: topProductsAgg,
        recentOrders,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- SUPPLIERS (ADMIN ONLY) ---
export const getSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 }).lean();
    res.json({ success: true, count: suppliers.length, suppliers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json({ success: true, supplier });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByIdAndUpdate(id, req.body, { new: true });
    if (!supplier) {
      res.status(404).json({ success: false, message: 'Supplier not found' });
      return;
    }
    res.json({ success: true, supplier });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) {
      res.status(404).json({ success: false, message: 'Supplier not found' });
      return;
    }
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- SHIPPING RULES (ADMIN) ---
export const getShippingRules = async (req: Request, res: Response): Promise<void> => {
  try {
    const rule = await ShippingRule.findOne({ isDefault: true }).lean();
    res.json({ success: true, shippingRule: rule });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateShippingRules = async (req: Request, res: Response): Promise<void> => {
  try {
    let rule = await ShippingRule.findOne({ isDefault: true });
    if (!rule) {
      rule = new ShippingRule(req.body);
    } else {
      Object.assign(rule, req.body);
    }
    await rule.save();
    res.json({ success: true, message: 'Shipping rules updated successfully', shippingRule: rule });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --- PERFORMANCE ANALYTICS (1D, 3D, 1W, 1M, 6M, 1Y, 2Y) ---
export const getPerformanceAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as string) || '1W';
    const now = new Date();

    interface BucketConfig {
      pointCount: number;
      periodName: string;
      getBucketRange: (i: number) => { start: Date; end: Date; label: string };
      totalDurationMs: number;
    }

    let config: BucketConfig;

    switch (period) {
      case '1D': {
        const stepHours = 3;
        const count = 8;
        config = {
          pointCount: count,
          periodName: 'Today',
          totalDurationMs: 24 * 60 * 60 * 1000,
          getBucketRange: (i) => {
            const start = new Date(now.getTime() - (count - i) * stepHours * 3600 * 1000);
            const end = new Date(now.getTime() - (count - 1 - i) * stepHours * 3600 * 1000);
            const h = start.getHours();
            return {
              start,
              end,
              label: `${h.toString().padStart(2, '0')}:00`,
            };
          },
        };
        break;
      }
      case '3D': {
        const stepHours = 12;
        const count = 6;
        config = {
          pointCount: count,
          periodName: 'Past 3 Days',
          totalDurationMs: 3 * 24 * 60 * 60 * 1000,
          getBucketRange: (i) => {
            const start = new Date(now.getTime() - (count - i) * stepHours * 3600 * 1000);
            const end = new Date(now.getTime() - (count - 1 - i) * stepHours * 3600 * 1000);
            return {
              start,
              end,
              label: start.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
            };
          },
        };
        break;
      }
      case '1W': {
        const count = 7;
        config = {
          pointCount: count,
          periodName: 'Past 7 Days',
          totalDurationMs: 7 * 24 * 60 * 60 * 1000,
          getBucketRange: (i) => {
            const start = new Date(now.getTime() - (count - i) * 24 * 60 * 60 * 1000);
            const end = new Date(now.getTime() - (count - 1 - i) * 24 * 60 * 60 * 1000);
            return {
              start,
              end,
              label: start.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
            };
          },
        };
        break;
      }
      case '1M': {
        const count = 10;
        config = {
          pointCount: count,
          periodName: 'Past 30 Days',
          totalDurationMs: 30 * 24 * 60 * 60 * 1000,
          getBucketRange: (i) => {
            const start = new Date(now.getTime() - (count - i) * 3 * 24 * 60 * 60 * 1000);
            const end = new Date(now.getTime() - (count - 1 - i) * 3 * 24 * 60 * 60 * 1000);
            return {
              start,
              end,
              label: start.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
            };
          },
        };
        break;
      }
      case '6M': {
        const count = 6;
        config = {
          pointCount: count,
          periodName: 'Past 6 Months',
          totalDurationMs: 180 * 24 * 60 * 60 * 1000,
          getBucketRange: (i) => {
            const start = new Date(now.getFullYear(), now.getMonth() - (count - i), 1);
            const end = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
            return {
              start,
              end,
              label: start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            };
          },
        };
        break;
      }
      case '1Y': {
        const count = 12;
        config = {
          pointCount: count,
          periodName: 'Past 1 Year',
          totalDurationMs: 365 * 24 * 60 * 60 * 1000,
          getBucketRange: (i) => {
            const start = new Date(now.getFullYear(), now.getMonth() - (count - i), 1);
            const end = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
            return {
              start,
              end,
              label: start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            };
          },
        };
        break;
      }
      case '2Y':
      default: {
        const count = 8;
        config = {
          pointCount: count,
          periodName: 'Past 2 Years',
          totalDurationMs: 730 * 24 * 60 * 60 * 1000,
          getBucketRange: (i) => {
            const start = new Date(now.getFullYear(), now.getMonth() - (count - i) * 3, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i) * 3, 1);
            return {
              start,
              end,
              label: start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            };
          },
        };
        break;
      }
    }

    const overallStart = new Date(now.getTime() - config.totalDurationMs);

    // Query 100% genuine orders and telemetry within requested timeframe
    const [orders, telemetryEvents] = await Promise.all([
      Order.find({
        createdAt: { $gte: overallStart, $lte: now },
        orderStatus: { $ne: 'CANCELLED' },
      }).lean(),
      Telemetry.find({
        createdAt: { $gte: overallStart, $lte: now },
      }).lean(),
    ]);

    const labels: string[] = [];
    const impressionsData: number[] = [];
    const clicksData: number[] = [];
    const purchasesData: number[] = [];
    const revenueData: number[] = [];

    for (let i = 0; i < config.pointCount; i++) {
      const bucket = config.getBucketRange(i);
      labels.push(bucket.label);

      const bucketStartTime = bucket.start.getTime();
      const bucketEndTime = bucket.end.getTime();

      const bucketOrders = orders.filter((o: any) => {
        const t = new Date(o.createdAt).getTime();
        return t >= bucketStartTime && t < bucketEndTime;
      });

      const bucketEvents = telemetryEvents.filter((e: any) => {
        const t = new Date(e.createdAt).getTime();
        return t >= bucketStartTime && t < bucketEndTime;
      });

      const pointImpressions = bucketEvents.filter((e: any) => e.eventType === 'impression').length;
      const pointClicks = bucketEvents.filter((e: any) => e.eventType === 'click').length;
      const pointPurchases = bucketOrders.length;
      const pointRevenue = bucketOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);

      impressionsData.push(pointImpressions);
      clicksData.push(pointClicks);
      purchasesData.push(pointPurchases);
      revenueData.push(pointRevenue);
    }

    const totalImpressions = telemetryEvents.filter((e: any) => e.eventType === 'impression').length;
    const totalClicks = telemetryEvents.filter((e: any) => e.eventType === 'click').length;
    const totalPurchases = orders.length;
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);

    const conversionRate = totalClicks > 0
      ? parseFloat(((totalPurchases / totalClicks) * 100).toFixed(2))
      : totalImpressions > 0
      ? parseFloat(((totalPurchases / totalImpressions) * 100).toFixed(2))
      : 0;

    const aov = totalPurchases > 0 ? Math.round(totalRevenue / totalPurchases) : 0;

    res.json({
      success: true,
      period,
      periodName: config.periodName,
      summary: {
        totalImpressions,
        totalClicks,
        totalPurchases,
        totalRevenue,
        conversionRate,
        aov,
      },
      chart: {
        labels,
        impressions: impressionsData,
        clicks: clicksData,
        purchases: purchasesData,
        revenue: revenueData,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
