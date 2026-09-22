import { config } from '../../config/env';
import { IOrder } from '../../models/Order';
import { Payment } from '../../models/Payment';

export class SafepayService {
  /**
   * Initializes a payment tracker with Safepay API and returns the hosted checkout URL
   */
  static async initiatePayment(order: IOrder): Promise<{
    success: boolean;
    paymentUrl: string;
    token: string;
  }> {
    try {
      const publicKey = config.SAFEPAY.PUBLIC_KEY;
      if (!publicKey) {
        throw new Error('Safepay Public Key is not configured in server environment');
      }

      const baseUrl = config.SAFEPAY.BASE_URL || 'https://sandbox.api.getsafepay.com';
      const environment = config.SAFEPAY.ENVIRONMENT || 'sandbox';

      // 1. Initialize tracker on Safepay API
      const initResponse = await fetch(`${baseUrl}/order/v1/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client: publicKey,
          amount: Math.round(order.total),
          currency: 'PKR',
          environment,
        }),
      });

      if (!initResponse.ok) {
        const errorText = await initResponse.text();
        console.error('Safepay init failed:', initResponse.status, errorText);
        throw new Error(`Safepay initialization failed: ${errorText}`);
      }

      const initData: any = await initResponse.json();
      const token = initData?.data?.token;

      if (!token) {
        throw new Error('Safepay did not return a valid tracker token');
      }

      // 2. Save Payment tracking document
      await Payment.create({
        orderId: order.orderId,
        orderRef: order._id,
        gateway: 'SAFEPAY',
        transactionId: token,
        amount: order.total,
        currency: 'PKR',
        status: 'INITIATED',
        requestReference: token,
      });

      order.gateway = 'SAFEPAY';
      order.paymentReference = token;
      await order.save();

      // 3. Construct Safepay Hosted Checkout redirect URL (Safepay uses /components endpoint)
      const clientUrl = config.CLIENT_URL || 'http://localhost:3000';
      const cancelUrl = `${clientUrl}/checkout?payment=cancelled&orderId=${order.orderId}`;
      const redirectUrl = `${clientUrl}/checkout/callback/safepay?orderId=${order.orderId}&beacon=${token}`;

      const paymentUrl = `${baseUrl}/components?beacon=${token}&cancel_url=${encodeURIComponent(
        cancelUrl
      )}&redirect_url=${encodeURIComponent(redirectUrl)}&source=custom`;

      return {
        success: true,
        paymentUrl,
        token,
      };
    } catch (error: any) {
      console.error('SafepayService initiatePayment error:', error);
      throw error;
    }
  }

  /**
   * Verifies the payment tracker status directly from Safepay API
   */
  static async verifyPayment(token: string): Promise<{
    success: boolean;
    state?: string;
    message?: string;
    raw?: any;
  }> {
    try {
      const baseUrl = config.SAFEPAY.BASE_URL || 'https://sandbox.api.getsafepay.com';
      const res = await fetch(`${baseUrl}/order/v1/${token}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        return { success: false, message: `Could not verify tracker: HTTP ${res.status}` };
      }

      const data: any = await res.json();
      const state = data?.data?.state;

      // In Safepay, TRACKER_ENDED or COMPLETED or PAID indicates successful checkout
      const isSuccessful = state === 'TRACKER_ENDED' || state === 'PAID' || state === 'COMPLETED';

      return {
        success: isSuccessful,
        state,
        raw: data?.data,
        message: isSuccessful ? 'Payment successful' : `Payment state: ${state}`,
      };
    } catch (error: any) {
      console.error('SafepayService verifyPayment error:', error);
      return { success: false, message: error.message };
    }
  }
}
