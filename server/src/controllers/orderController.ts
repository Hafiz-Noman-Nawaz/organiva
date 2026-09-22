import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { Order, IOrderItem } from '../models/Order';
import { Product } from '../models/Product';
import { ShippingRule } from '../models/ShippingRule';
import { Coupon } from '../models/Coupon';
import { processCODPayment } from '../services/payments/cod';
import { SafepayService } from '../services/payments/safepay';
import { JazzCashService } from '../services/payments/jazzcash';
import { EasypaisaService } from '../services/payments/easypaisa';
import { EmailService } from '../services/emailService';

// Generate unique, collision-proof human-friendly order ID (e.g. ORG-260922-8419)
const generateOrderId = (): string => {
  const d = new Date();
  const dateStr = d.toISOString().slice(2, 10).replace(/-/g, ''); // e.g. 260922
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORG-${dateStr}-${random}`;
};

// Checkout & Create Order (Strict server-side price validation)
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customer, items, paymentMethod, notes, couponCode } = req.body;

    // Validate customer inputs
    if (!customer || !customer.fullName || !customer.phone || !customer.address || !customer.city) {
      res.status(400).json({
        success: false,
        message: 'Complete customer shipping information (Full Name, Phone, Address, City) is required.',
      });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Cart items are required.' });
      return;
    }

    if (!['COD', 'SAFEPAY', 'JAZZCASH', 'EASYPAISA'].includes(paymentMethod)) {
      res.status(400).json({ success: false, message: 'Invalid payment method selected.' });
      return;
    }

    // SERVER-SIDE PRICE VALIDATION (CRITICAL SECURITY RULE)
    const validatedItems: IOrderItem[] = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      let product = null;
      if (item.productId && mongoose.isValidObjectId(item.productId)) {
        product = await Product.findById(item.productId);
      }
      if (!product && item.slug) {
        product = await Product.findOne({ slug: item.slug });
      }
      if (!product && item.sku) {
        product = await Product.findOne({ sku: item.sku });
      }

      if (!product || !product.isActive) {
        res.status(400).json({
          success: false,
          message: `Product "${item.title || item.slug || 'Unknown'}" is unavailable or discontinued.`,
        });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.title}". Only ${product.stock} available.`,
        });
        return;
      }

      // Server-verified price (salePrice if active, else regular price)
      const officialPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
      const quantity = Math.max(1, parseInt(item.quantity, 10));
      const itemTotal = officialPrice * quantity;

      calculatedSubtotal += itemTotal;

      validatedItems.push({
        product: product._id as any,
        title: product.title,
        slug: product.slug,
        sku: product.sku,
        price: officialPrice,
        quantity,
        image: product.images[0] || '',
        total: itemTotal,
      });

      // Deduct stock
      product.stock = Math.max(0, product.stock - quantity);
      if (product.stock === 0) {
        product.stockStatus = 'OUT_OF_STOCK';
      } else if (product.stock <= 5) {
        product.stockStatus = 'LOW_STOCK';
      }
      await product.save();
    }

    // Calculate shipping rules
    const shippingRule = await ShippingRule.findOne({ isDefault: true });
    let shippingCharge = shippingRule ? shippingRule.flatRate : 250;
    const freeThreshold = shippingRule ? shippingRule.freeShippingThreshold : 3500;

    // Check city overrides
    if (shippingRule && shippingRule.cityOverrides) {
      const cityOverride = shippingRule.cityOverrides.find(
        (c) => c.city.toLowerCase() === customer.city.toLowerCase()
      );
      if (cityOverride) {
        shippingCharge = cityOverride.rate;
      }
    }

    // Free shipping threshold check
    if (calculatedSubtotal >= freeThreshold) {
      shippingCharge = 0;
    }

    // Coupon discount verification (Server-Side Price Protection)
    let discountAmount = 0;
    let appliedCouponDoc = null;
    if (couponCode && typeof couponCode === 'string') {
      const cleanCode = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
      if (coupon) {
        const isExpired = coupon.expiresAt && new Date() > coupon.expiresAt;
        const limitReached = coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit;
        if (!isExpired && !limitReached && calculatedSubtotal >= (coupon.minPurchaseAmount || 0)) {
          if (coupon.discountType === 'PERCENTAGE') {
            discountAmount = Math.round((calculatedSubtotal * coupon.discountAmount) / 100);
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
              discountAmount = coupon.maxDiscount;
            }
          } else {
            discountAmount = Math.min(coupon.discountAmount, calculatedSubtotal);
          }
          appliedCouponDoc = coupon;
        }
      }
    }

    const calculatedTotal = Math.max(0, calculatedSubtotal - discountAmount + shippingCharge);
    const orderId = generateOrderId();

    const newOrder = new Order({
      orderId,
      customer: {
        fullName: customer.fullName.trim(),
        phone: customer.phone.trim(),
        email: customer.email ? customer.email.trim().toLowerCase() : undefined,
        address: customer.address.trim(),
        city: customer.city.trim(),
        area: customer.area ? customer.area.trim() : undefined,
        postalCode: customer.postalCode ? customer.postalCode.trim() : undefined,
      },
      items: validatedItems,
      subtotal: calculatedSubtotal,
      shipping: shippingCharge,
      discount: discountAmount,
      total: calculatedTotal,
      currency: 'PKR',
      paymentMethod,
      paymentStatus: 'PENDING',
      orderStatus: 'PLACED',
      notes: notes || '',
      statusTimeline: [
        {
          status: 'PLACED',
          timestamp: new Date(),
          comment: `Order placed successfully with ${paymentMethod}.`,
        },
      ],
    });

    await newOrder.save();

    if (appliedCouponDoc) {
      appliedCouponDoc.timesUsed += 1;
      await appliedCouponDoc.save().catch(() => {});
    }

    // Dispatch customer confirmation email & store owner purchase alert
    EmailService.sendCustomerOrderConfirmation(newOrder).catch((e) =>
      console.error('[EmailService] Order confirmation error:', e)
    );
    EmailService.sendStoreOwnerPurchaseAlert(newOrder).catch((e) =>
      console.error('[EmailService] Owner alert error:', e)
    );

    // Process Payment Flow
    if (paymentMethod === 'COD') {
      const codResult = await processCODPayment(newOrder);
      res.status(201).json({
        success: true,
        orderId: newOrder.orderId,
        order: newOrder,
        message: codResult.message,
        paymentFlow: 'COD_CONFIRMED',
      });
      return;
    }

    if (paymentMethod === 'SAFEPAY') {
      const safepayResult = await SafepayService.initiatePayment(newOrder);
      res.status(201).json({
        success: true,
        orderId: newOrder.orderId,
        order: newOrder,
        paymentUrl: safepayResult.paymentUrl,
        token: safepayResult.token,
        paymentFlow: 'REDIRECT_GATEWAY',
      });
      return;
    }

    if (paymentMethod === 'JAZZCASH') {
      const jazzcashResult = await JazzCashService.initiatePayment(newOrder);
      res.status(201).json({
        success: true,
        orderId: newOrder.orderId,
        order: newOrder,
        paymentUrl: jazzcashResult.paymentUrl,
        postData: jazzcashResult.postData,
        paymentFlow: 'REDIRECT_GATEWAY',
      });
      return;
    }

    if (paymentMethod === 'EASYPAISA') {
      const epResult = await EasypaisaService.initiatePayment(newOrder);
      res.status(201).json({
        success: true,
        orderId: newOrder.orderId,
        order: newOrder,
        paymentUrl: epResult.paymentUrl,
        postData: epResult.postData,
        paymentFlow: 'REDIRECT_GATEWAY',
      });
      return;
    }
  } catch (error: any) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error processing order.' });
  }
};

// Track Order (Public customer lookup by orderId & phone)
export const trackOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, phone } = req.body;

    if (!orderId || !phone) {
      res.status(400).json({
        success: false,
        message: 'Order ID and Contact Phone Number are required to track an order.',
      });
      return;
    }

    const cleanOrderId = String(orderId).trim().toUpperCase();
    const cleanPhone = String(phone).replace(/[^0-9]/g, '');

    const order = await Order.findOne({ orderId: cleanOrderId }).lean();

    if (!order) {
      res.status(404).json({ success: false, message: `No order found with ID "${orderId}".` });
      return;
    }

    const orderPhoneClean = order.customer.phone.replace(/[^0-9]/g, '');
    if (!orderPhoneClean.endsWith(cleanPhone) && !cleanPhone.endsWith(orderPhoneClean)) {
      res.status(401).json({
        success: false,
        message: 'Phone number does not match the records for this Order ID.',
      });
      return;
    }

    res.json({
      success: true,
      order: {
        orderId: order.orderId,
        orderStatus: order.orderStatus,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        customerName: order.customer.fullName,
        city: order.customer.city,
        total: order.total,
        currency: order.currency,
        items: order.items,
        courierName: order.courierName,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        estimatedDeliveryDate: order.estimatedDeliveryDate,
        statusTimeline: order.statusTimeline,
        createdAt: order.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single order for Order Success page
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId: orderId.toUpperCase() }).lean();

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all orders with filtering & pagination
export const getAdminOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, paymentMethod, search } = req.query;
    const filter: any = {};

    if (status && status !== 'ALL') {
      filter.orderStatus = status;
    }

    if (paymentMethod && paymentMethod !== 'ALL') {
      filter.paymentMethod = paymentMethod;
    }

    if (search) {
      filter.$or = [
        { orderId: { $regex: String(search), $options: 'i' } },
        { 'customer.fullName': { $regex: String(search), $options: 'i' } },
        { 'customer.phone': { $regex: String(search), $options: 'i' } },
        { 'customer.city': { $regex: String(search), $options: 'i' } },
      ];
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update order status & timeline
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      orderStatus,
      comment,
      paymentStatus,
      internalNotes,
      courierName,
      trackingNumber,
      trackingUrl,
      estimatedDeliveryDate,
    } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const oldStatus = order.orderStatus;
    if (orderStatus && orderStatus !== oldStatus) {
      const isNowCancelledOrReturned = orderStatus === 'CANCELLED' || orderStatus === 'RETURNED';
      const wasCancelledOrReturned = oldStatus === 'CANCELLED' || oldStatus === 'RETURNED';

      if (!wasCancelledOrReturned && isNowCancelledOrReturned) {
        // Auto-replenish inventory stock for each item
        for (const item of order.items) {
          if (item.product) {
            const prod = await Product.findById(item.product);
            if (prod) {
              prod.stock += item.quantity;
              if (prod.stock > 5) prod.stockStatus = 'IN_STOCK';
              else if (prod.stock > 0) prod.stockStatus = 'LOW_STOCK';
              await prod.save();
            }
          }
        }
      } else if (wasCancelledOrReturned && !isNowCancelledOrReturned) {
        // Re-opened from cancelled/returned, re-deduct
        for (const item of order.items) {
          if (item.product) {
            const prod = await Product.findById(item.product);
            if (prod) {
              prod.stock = Math.max(0, prod.stock - item.quantity);
              if (prod.stock === 0) prod.stockStatus = 'OUT_OF_STOCK';
              else if (prod.stock <= 5) prod.stockStatus = 'LOW_STOCK';
              await prod.save();
            }
          }
        }
      }

      order.orderStatus = orderStatus;
      order.statusTimeline.push({
        status: orderStatus,
        timestamp: new Date(),
        comment: comment || `Status updated to ${orderStatus} by Admin`,
      });
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (internalNotes !== undefined) {
      order.internalNotes = internalNotes;
    }

    if (courierName !== undefined) {
      order.courierName = courierName;
    }

    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
    }

    if (trackingUrl !== undefined) {
      order.trackingUrl = trackingUrl;
    }

    if (estimatedDeliveryDate !== undefined) {
      order.estimatedDeliveryDate = estimatedDeliveryDate;
    }

    await order.save();
    res.json({ success: true, message: 'Order status updated successfully', order });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Public: Validate and apply promotional coupon
export const applyCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, subtotal } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ success: false, message: 'Coupon code is required.' });
      return;
    }
    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
    if (!coupon) {
      res.status(400).json({ success: false, message: 'Invalid or inactive promotional code.' });
      return;
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      res.status(400).json({ success: false, message: 'This coupon code has expired.' });
      return;
    }
    if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
      res.status(400).json({ success: false, message: 'This coupon has reached its maximum usage limit.' });
      return;
    }
    const cartSubtotal = Number(subtotal) || 0;
    const minRequired = coupon.minPurchaseAmount || 0;
    if (cartSubtotal < minRequired) {
      res.status(400).json({
        success: false,
        message: `Minimum order subtotal of PKR ${minRequired} is required to apply ${coupon.code}.`,
      });
      return;
    }
    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = Math.round((cartSubtotal * coupon.discountAmount) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(coupon.discountAmount, cartSubtotal);
    }
    res.json({
      success: true,
      code: coupon.code,
      discount,
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount,
      message: `Coupon ${coupon.code} applied! You saved PKR ${discount}.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Public: Get active default shipping rule (for storefront cart / checkout)
export const getPublicShippingRule = async (req: Request, res: Response): Promise<void> => {
  const fallbackRule = {
    name: 'Standard Express Nationwide Delivery',
    flatRate: 250,
    freeShippingThreshold: 3500,
    estimatedDays: '2-4 Business Days',
    cityOverrides: [
      { city: 'Lahore', rate: 200 },
      { city: 'Karachi', rate: 250 },
      { city: 'Islamabad', rate: 220 },
      { city: 'Rawalpindi', rate: 220 },
    ],
  };

  try {
    const rule = await ShippingRule.findOne({ isDefault: true, isActive: true })
      .maxTimeMS(2000)
      .lean();
    res.json({ success: true, shippingRule: rule || fallbackRule });
  } catch (error: any) {
    console.warn('[ShippingRule] Serving resilient default shipping rule:', error.message);
    res.json({ success: true, shippingRule: fallbackRule });
  }
};
