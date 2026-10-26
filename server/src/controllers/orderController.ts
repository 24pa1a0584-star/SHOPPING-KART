import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Order } from '../models/Order';
import { OrderService } from '../services/orderService';
import mongoose from 'mongoose';

export const listOwnOrders = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const orders = await Order.find({ customerId: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({ success: true, orders });
};

export const getOrderDetails = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { identifier } = req.params; // Can be orderReference or Mongo ObjectId

  let query: any = {};
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    query._id = identifier;
  } else {
    query.orderReference = identifier;
  }

  const order = await Order.findOne(query).lean();
  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found.' });
    return;
  }

  // Security check: Customer can only view their own orders; Admin can view all
  if (req.user) {
    if (
      req.user.role !== 'admin' &&
      order.customerId &&
      order.customerId.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({ success: false, message: 'Forbidden. You do not own this order.' });
      return;
    }
  } else {
    // Guest access: must provide email query param matching order email
    const guestEmail = req.query.email as string;
    if (!guestEmail || guestEmail.toLowerCase() !== order.customerEmail.toLowerCase()) {
      res.status(403).json({
        success: false,
        message: 'Order access requires verification of the email address used during checkout.',
      });
      return;
    }
  }

  res.status(200).json({ success: true, order });
};

export const cancelOrder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { orderId } = req.params;
  const { reason } = req.body;
  const userId = req.user?._id?.toString();

  try {
    const cancelledOrder = await OrderService.cancelOrder(orderId, userId, reason);
    res.status(200).json({
      success: true,
      message: 'Order has been successfully cancelled and inventory restocked.',
      order: cancelledOrder,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
