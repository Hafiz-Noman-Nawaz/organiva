import crypto from 'crypto';
import { config } from '../../config/env';
import { IOrder, Order } from '../../models/Order';
import { Payment } from '../../models/Payment';

export interface EasypaisaInitResponse {
  paymentUrl: string;
  postData: Record<string, string>;
  txnRefNo: string;
  isMock: boolean;
}

export class EasypaisaService {
  private static calculateHash(params: Record<string, string>, hashKey: string): string {
    const sortedKeys = Object.keys(params).sort();
    const concatenated = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');
    return crypto.createHmac('sha256', hashKey).update(concatenated).digest('hex');
  }

  public static async initiatePayment(order: IOrder): Promise<EasypaisaInitResponse> {
    const txnRefNo = `EP${Date.now().toString().slice(-10)}`;

    const postData: Record<string, string> = {
      storeId: config.EASYPAISA.MERCHANT_ID,
      orderId: order.orderId,
      transactionAmount: order.total.toFixed(2),
      mobileAccountNo: order.customer.phone.replace(/[^0-9]/g, ''),
      emailAddress: order.customer.email || 'customer@organiva.pk',
      postBackURL: config.EASYPAISA.RETURN_URL,
      transactionType: 'MA',
      tokenExpiryInSeconds: '1800',
    };

    const hash = this.calculateHash(postData, config.EASYPAISA.HASH_KEY);
    postData.hash = hash;

    await Payment.create({
      orderId: order.orderId,
      orderRef: order._id,
      gateway: 'EASYPAISA',
      transactionId: txnRefNo,
      amount: order.total,
      currency: 'PKR',
      status: 'INITIATED',
      requestReference: txnRefNo,
      rawStatus: { postData },
    });

    const isMock = config.EASYPAISA.MERCHANT_ID === 'EP12345';
    const paymentUrl = isMock
      ? `${config.CLIENT_URL}/checkout/sandbox?gateway=easypaisa&orderId=${order.orderId}&txnRef=${txnRefNo}&amount=${order.total}`
      : 'https://easypay.easypaisa.com.pk/easypay/Index.jsf';

    return {
      paymentUrl,
      postData,
      txnRefNo,
      isMock,
    };
  }

  public static async verifyCallback(callbackData: Record<string, any>): Promise<{ success: boolean; orderId: string; message: string }> {
    const { orderRefNumber, orderId, auth_status, desc, responseCode, txnRefNo } = callbackData;

    const queryId = orderId || orderRefNumber;
    const order = await Order.findOne({ orderId: queryId });
    if (!order) {
      return { success: false, orderId: queryId || 'UNKNOWN', message: 'Order not found' };
    }

    const ref = txnRefNo || `EP-${Date.now()}`;
    const payment = await Payment.findOne({ orderId: order.orderId });

    // Easypaisa success code '0000' or status 'PAID' or mockStatus 'SUCCESS'
    const isSuccess = auth_status === '0000' || responseCode === '0000' || callbackData.mockStatus === 'SUCCESS';

    if (isSuccess) {
      order.paymentStatus = 'PAID';
      order.paymentReference = ref;
      order.orderStatus = 'CONFIRMED';
      order.statusTimeline.push({
        status: 'CONFIRMED',
        timestamp: new Date(),
        comment: `Online payment of PKR ${order.total} confirmed via Easypaisa (Ref: ${ref})`,
      });
      await order.save();

      if (payment) {
        payment.status = 'SUCCESS';
        payment.rawStatus = callbackData;
        await payment.save();
      }

      return { success: true, orderId: order.orderId, message: 'Easypaisa payment verified successfully' };
    } else {
      if (payment) {
        payment.status = 'FAILED';
        payment.rawStatus = callbackData;
        await payment.save();
      }
      return { success: false, orderId: order.orderId, message: desc || 'Payment failed' };
    }
  }
}
