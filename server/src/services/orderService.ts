import { Order, IOrder } from '../models/Order';
import { InventoryService } from './inventoryService';
import { PricingQuote } from './pricingService';
import { Coupon } from '../models/Coupon';

export class OrderService {
  /**
   * Generates a unique, collision-resistant human-readable order reference.
   * e.g. LUM-ORD-2026-000101
   */
  static async generateOrderReference(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await Order.countDocuments();
    const sequenceNumber = (count + 1).toString().padStart(6, '0');
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `LUM-ORD-${year}-${sequenceNumber}-${randomSuffix}`;
  }

  /**
   * Creates a confirmed order after stock deduction and price calculation.
   */
  static async createOrder(params: {
    orderReference: string;
    customerId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    quote: PricingQuote;
    shippingAddress: any;
    paymentMethod: 'DEMO' | 'RAZORPAY' | 'COD';
    paymentStatus: 'PAID' | 'PENDING';
    transactionId?: string;
  }): Promise<IOrder> {
    const {
      orderReference,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      quote,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      transactionId,
    } = params;

    const order = await Order.create({
      orderReference,
      customerId: customerId || undefined,
      customerName,
      customerEmail,
      customerPhone,
      items: quote.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        sku: item.sku,
        options: item.options,
        unitPricePaise: item.unitPricePaise,
        quantity: item.quantity,
        lineTotalPaise: item.lineTotalPaise,
        image: item.image,
      })),
      shippingAddress,
      pricing: {
        subtotalPaise: quote.subtotalPaise,
        discountPaise: quote.discountPaise,
        couponCode: quote.appliedCoupon?.code,
        shippingCostPaise: quote.shippingCostPaise,
        taxPaise: quote.taxPaise,
        totalPaise: quote.totalPaise,
      },
      payment: {
        method: paymentMethod,
        status: paymentStatus,
        transactionId,
        verifiedAt: paymentStatus === 'PAID' ? new Date() : undefined,
      },
      fulfillment: {
        status: 'PLACED',
      },
      timeline: [
        {
          status: 'ORDER_PLACED',
          timestamp: new Date(),
          note: `Order placed successfully via ${paymentMethod} (${paymentStatus}).`,
        },
      ],
    });

    // Increment coupon used count if a coupon was used
    if (quote.appliedCoupon?.code) {
      await Coupon.updateOne(
        { code: quote.appliedCoupon.code },
        { $inc: { usedCount: 1 } }
      );
    }

    return order;
  }

  /**
   * Cancel an eligible order and restore inventory atomically.
   */
  static async cancelOrder(
    orderId: string,
    userId?: string,
    reason?: string
  ): Promise<IOrder> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found.');
    }

    // Authorization check: if userId provided, must be owner
    if (userId && order.customerId && order.customerId.toString() !== userId) {
      throw new Error('You are not authorized to cancel this order.');
    }

    // Cancellation eligibility check
    const eligibleStatuses = ['PLACED', 'CONFIRMED', 'PROCESSING'];
    if (!eligibleStatuses.includes(order.fulfillment.status)) {
      throw new Error(
        `Cannot cancel order with fulfillment status "${order.fulfillment.status}".`
      );
    }

    // Restore inventory
    const itemsToRestore = order.items.map((item) => ({
      variantId: item.variantId.toString(),
      quantity: item.quantity,
    }));

    await InventoryService.restoreStock(
      itemsToRestore,
      order.orderReference,
      `Restock from cancelled order ${order.orderReference}: ${reason || 'User/Admin cancellation'}`
    );

    // Update order status
    order.fulfillment.status = 'CANCELLED';
    if (order.payment.status === 'PAID') {
      order.payment.status = 'REFUNDED';
    }
    order.timeline.push({
      status: 'CANCELLED',
      timestamp: new Date(),
      note: reason || 'Order cancelled by customer/admin.',
    });

    await order.save();
    return order;
  }
}
