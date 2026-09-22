import { Request, Response } from 'express';
import { JazzCashService } from '../services/payments/jazzcash';
import { EasypaisaService } from '../services/payments/easypaisa';
import { SafepayService } from '../services/payments/safepay';
import { Order } from '../models/Order';
import { Payment } from '../models/Payment';
import { config } from '../config/env';

// JazzCash Callback (Webhook / Return URL)
export const handleJazzCashCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const callbackData = req.method === 'POST' ? req.body : req.query;
    console.log('JazzCash Gateway Callback received:', callbackData);

    const result = await JazzCashService.verifyCallback(callbackData);

    if (result.success) {
      res.redirect(`/order-success/${result.orderId}?payment=success&gateway=jazzcash`);
    } else {
      res.redirect(`/checkout?payment=failed&reason=${encodeURIComponent(result.message)}&orderId=${result.orderId}`);
    }
  } catch (error: any) {
    console.error('JazzCash callback error:', error);
    res.redirect(`/checkout?payment=error&message=${encodeURIComponent(error.message)}`);
  }
};

// Easypaisa Callback (Webhook / Return URL)
export const handleEasypaisaCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const callbackData = req.method === 'POST' ? req.body : req.query;
    console.log('Easypaisa Gateway Callback received:', callbackData);

    const result = await EasypaisaService.verifyCallback(callbackData);

    if (result.success) {
      res.redirect(`/order-success/${result.orderId}?payment=success&gateway=easypaisa`);
    } else {
      res.redirect(`/checkout?payment=failed&reason=${encodeURIComponent(result.message)}&orderId=${result.orderId}`);
    }
  } catch (error: any) {
    console.error('Easypaisa callback error:', error);
    res.redirect(`/checkout?payment=error&message=${encodeURIComponent(error.message)}`);
  }
};

// Mock sandbox confirmation endpoint for local dev / testing
export const mockConfirmPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, gateway, status } = req.body;

    const order = await Order.findOne({ orderId: orderId.toUpperCase() });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (status === 'SUCCESS') {
      order.paymentStatus = 'PAID';
      order.orderStatus = 'CONFIRMED';
      order.paymentReference = `SANDBOX-${gateway}-${Date.now()}`;
      order.statusTimeline.push({
        status: 'CONFIRMED',
        timestamp: new Date(),
        comment: `Sandbox payment test successful for ${gateway} (PKR ${order.total}).`,
      });
      await order.save();

      await Payment.findOneAndUpdate(
        { orderId: order.orderId },
        { status: 'SUCCESS', responseReference: order.paymentReference },
        { new: true }
      );

      res.json({ success: true, message: 'Sandbox payment confirmed', order });
    } else {
      order.paymentStatus = 'FAILED';
      await order.save();

      res.json({ success: false, message: 'Sandbox payment marked failed', order });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Safepay Gateway Callback & Return URL Handler
export const handleSafepayCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = { ...req.query, ...req.body };
    const orderId = (data.orderId || data.order_id || '') as string;
    const token = (data.beacon || data.tracker || '') as string;

    console.log('Safepay Callback received for order:', orderId, 'token:', token);

    if (!orderId) {
      res.redirect(`${config.CLIENT_URL}/checkout?payment=error&message=Missing+Order+ID`);
      return;
    }

    const order = await Order.findOne({ orderId: orderId.toUpperCase() });
    if (!order) {
      res.redirect(`${config.CLIENT_URL}/checkout?payment=error&message=Order+not+found`);
      return;
    }

    // Verify tracker state from Safepay sandbox API
    let isSuccess = true;
    if (token) {
      const verification = await SafepayService.verifyPayment(token);
      // In sandbox, if state is TRACKER_ENDED or COMPLETED, payment is confirmed
      isSuccess = verification.success || verification.state === 'TRACKER_ENDED';
    }

    if (isSuccess) {
      order.paymentStatus = 'PAID';
      order.orderStatus = 'CONFIRMED';
      order.paymentReference = token || order.paymentReference;
      order.statusTimeline.push({
        status: 'CONFIRMED',
        timestamp: new Date(),
        comment: `Safepay sandbox payment verified successfully (PKR ${order.total}).`,
      });
      await order.save();

      await Payment.findOneAndUpdate(
        { orderId: order.orderId },
        { status: 'SUCCESS', responseReference: token },
        { new: true }
      );

      res.redirect(`${config.CLIENT_URL}/order-success/${order.orderId}?payment=success&gateway=safepay`);
    } else {
      order.paymentStatus = 'FAILED';
      await order.save();
      res.redirect(`${config.CLIENT_URL}/checkout?payment=failed&orderId=${order.orderId}&gateway=safepay`);
    }
  } catch (error: any) {
    console.error('Safepay callback error:', error);
    res.redirect(`${config.CLIENT_URL}/checkout?payment=error&message=${encodeURIComponent(error.message)}`);
  }
};

// Safepay verification endpoint for client callback page
export const verifySafepayPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, beacon, tracker, simulatedSuccess } = req.body;
    const token = tracker || beacon;

    if (!orderId) {
      res.status(400).json({ success: false, message: 'orderId is required' });
      return;
    }

    const order = await Order.findOne({ orderId: orderId.toUpperCase() });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    let isSuccess = false;
    let state = 'UNKNOWN';

    if (token) {
      const result = await SafepayService.verifyPayment(token);
      isSuccess = result.success || result.state === 'TRACKER_ENDED';
      state = result.state || '';
    }

    // Allow simulation flag strictly in development sandbox environments
    const isSandboxEnv = config.NODE_ENV !== 'production' && config.SAFEPAY.ENVIRONMENT === 'sandbox';
    if (simulatedSuccess && isSandboxEnv) {
      isSuccess = true;
    }

    if (isSuccess) {
      order.paymentStatus = 'PAID';
      order.orderStatus = 'CONFIRMED';
      order.paymentReference = token || `SP-SANDBOX-${Date.now()}`;
      order.statusTimeline.push({
        status: 'CONFIRMED',
        timestamp: new Date(),
        comment: `Safepay online payment confirmed (PKR ${order.total}).`,
      });
      await order.save();

      await Payment.findOneAndUpdate(
        { orderId: order.orderId },
        { status: 'SUCCESS', responseReference: order.paymentReference },
        { new: true }
      );

      res.json({ success: true, message: 'Safepay payment confirmed', order });
    } else {
      res.json({
        success: false,
        message: `Payment tracker state: ${state || 'PENDING'}`,
        state,
        order,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
