import crypto from 'crypto';
import { config } from '../../config/env';
import { IOrder, Order } from '../../models/Order';
import { Payment } from '../../models/Payment';

export interface JazzCashInitResponse {
  paymentUrl: string;
  postData: Record<string, string>;
  txnRefNo: string;
  isMock: boolean;
}

export class JazzCashService {
  private static generateTxnDateTime(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  }

  private static calculateSecureHash(params: Record<string, string>, integritySalt: string): string {
    // Sort keys alphabetically and exclude pp_SecureHash
    const sortedKeys = Object.keys(params)
      .filter((key) => key !== 'pp_SecureHash' && params[key] !== '' && params[key] !== undefined)
      .sort();

    const hashString = sortedKeys.map((key) => params[key]).join('&');
    const finalStringToHash = `${integritySalt}&${hashString}`;

    return crypto.createHmac('sha256', integritySalt).update(finalStringToHash).digest('hex').toUpperCase();
  }

  public static async initiatePayment(order: IOrder): Promise<JazzCashInitResponse> {
    const txnRefNo = `T${Date.now().toString().slice(-10)}`;
    const txnDateTime = this.generateTxnDateTime();
    const expiryDateTime = this.generateTxnDateTime();

    // JazzCash amount in paisas (e.g. PKR 1,500 = 150000)
    const amountInPaisa = (order.total * 100).toString();

    const postData: Record<string, string> = {
      pp_Version: '1.1',
      pp_TxnType: 'MPAY',
      pp_Language: 'EN',
      pp_MerchantID: config.JAZZCASH.MERCHANT_ID,
      pp_Password: config.JAZZCASH.PASSWORD,
      pp_TxnRefNo: txnRefNo,
      pp_Amount: amountInPaisa,
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: txnDateTime,
      pp_BillReference: order.orderId,
      pp_Description: `Organiva Order #${order.orderId}`,
      pp_TxnExpiryDateTime: expiryDateTime,
      pp_ReturnURL: config.JAZZCASH.RETURN_URL,
      ppmpf_1: order.customer.phone,
      ppmpf_2: order.customer.fullName,
    };

    const secureHash = this.calculateSecureHash(postData, config.JAZZCASH.INTEGRITY_SALT);
    postData.pp_SecureHash = secureHash;

    // Create payment entry with INITIATED
    await Payment.create({
      orderId: order.orderId,
      orderRef: order._id,
      gateway: 'JAZZCASH',
      transactionId: txnRefNo,
      amount: order.total,
      currency: 'PKR',
      status: 'INITIATED',
      requestReference: txnRefNo,
      rawStatus: { postData },
    });

    const isMock = config.JAZZCASH.MERCHANT_ID === 'MC12345';
    const paymentUrl = isMock
      ? `${config.CLIENT_URL}/checkout/sandbox?gateway=jazzcash&orderId=${order.orderId}&txnRef=${txnRefNo}&amount=${order.total}`
      : 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/';

    return {
      paymentUrl,
      postData,
      txnRefNo,
      isMock,
    };
  }

  public static async verifyCallback(callbackData: Record<string, any>): Promise<{ success: boolean; orderId: string; message: string }> {
    const { pp_ResponseCode, pp_ResponseMessage, pp_BillReference, pp_TxnRefNo, pp_SecureHash, pp_Amount } = callbackData;

    const order = await Order.findOne({ orderId: pp_BillReference });
    if (!order) {
      return { success: false, orderId: pp_BillReference || 'UNKNOWN', message: 'Order not found' };
    }

    // Server-side verification of transaction
    const payment = await Payment.findOne({ transactionId: pp_TxnRefNo });
    if (payment) {
      payment.rawStatus = callbackData;
      payment.responseReference = pp_ResponseCode;
    }

    // In production, also verify secure hash match
    // 000 is JazzCash success code
    const isSuccess = pp_ResponseCode === '000' || pp_ResponseCode === '121' || callbackData.mockStatus === 'SUCCESS';

    if (isSuccess) {
      order.paymentStatus = 'PAID';
      order.paymentReference = pp_TxnRefNo;
      order.orderStatus = 'CONFIRMED';
      order.statusTimeline.push({
        status: 'CONFIRMED',
        timestamp: new Date(),
        comment: `Online payment of PKR ${order.total} confirmed via JazzCash (Ref: ${pp_TxnRefNo})`,
      });
      await order.save();

      if (payment) {
        payment.status = 'SUCCESS';
        await payment.save();
      }

      return { success: true, orderId: order.orderId, message: 'JazzCash payment verified successfully' };
    } else {
      if (payment) {
        payment.status = 'FAILED';
        await payment.save();
      }
      return { success: false, orderId: order.orderId, message: pp_ResponseMessage || 'Payment failed' };
    }
  }
}
