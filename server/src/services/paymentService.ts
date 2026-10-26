import crypto from 'crypto';
import { env } from '../config/env';

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

export class PaymentService {
  /**
   * Generates a simulated transaction ID for Demo mode transactions.
   */
  static generateDemoTransactionId(): string {
    return `DEMO_TXN_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }

  /**
   * Verifies Razorpay HMAC-SHA256 signature
   */
  static verifyRazorpaySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    signature: string
  ): boolean {
    if (!env.RAZORPAY_KEY_SECRET) {
      return false;
    }
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Verifies whether payment status is safe to fulfill
   */
  static isPaymentValidForFulfillment(
    paymentMethod: 'DEMO' | 'RAZORPAY' | 'COD',
    paymentStatus: string
  ): boolean {
    if (paymentMethod === 'COD') {
      // Cash on Delivery allows order placement with PENDING status
      return paymentStatus === 'PENDING';
    }
    return paymentStatus === 'PAID';
  }
}
