import { Order, IOrder } from '../../models/Order';
import { Payment } from '../../models/Payment';

export interface ProcessCODResult {
  success: boolean;
  order: IOrder;
  message: string;
}

export const processCODPayment = async (order: IOrder): Promise<ProcessCODResult> => {
  // COD orders are automatically placed with paymentStatus: PENDING
  // Payment will be collected on delivery
  const transactionId = `COD-${order.orderId}-${Date.now()}`;

  const payment = new Payment({
    orderId: order.orderId,
    orderRef: order._id,
    gateway: 'COD',
    transactionId,
    amount: order.total,
    currency: order.currency || 'PKR',
    status: 'SUCCESS', // The COD authorization is recorded
    rawStatus: {
      type: 'CASH_ON_DELIVERY',
      authorizedAt: new Date().toISOString(),
      payableOnDelivery: order.total,
    },
  });

  await payment.save();

  // Update order status timeline
  order.paymentReference = transactionId;
  order.statusTimeline.push({
    status: 'PLACED',
    timestamp: new Date(),
    comment: 'Order placed with Cash on Delivery (Pay upon receipt)',
  });

  await order.save();

  return {
    success: true,
    order,
    message: 'Cash on Delivery order placed successfully.',
  };
};
