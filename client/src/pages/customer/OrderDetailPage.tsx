import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Calendar,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../services/api';
import { IOrder } from '../../types';
import { formatINR, formatDate, formatDateTime } from '../../lib/utils';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

export const OrderDetailPage: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of delivery preference');

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${identifier}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load order');
      navigate('/orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (identifier) fetchOrder();
  }, [identifier]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      const res = await api.post(`/orders/${order._id}/cancel`, { reason: cancelReason });
      if (res.data.success) {
        toast.success(res.data.message);
        setOrder(res.data.order);
        setShowCancelModal(false);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 w-60 bg-gray-200 rounded" />
        <div className="h-64 bg-gray-200 rounded-3xl" />
      </div>
    );
  }

  const isEligibleForCancel = ['PLACED', 'CONFIRMED', 'PROCESSING'].includes(
    order.fulfillment.status
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#7444FF] mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Orders
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#14152D]">
              Order {order.orderReference}
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Placed on {formatDateTime(order.createdAt)} • Payment Method: {order.payment.method}
          </p>
        </div>

        {isEligibleForCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCancelModal(true)}
            className="text-[#FF6B67] hover:border-[#FF6B67] hover:text-[#FF6B67]"
          >
            Cancel Order
          </Button>
        )}
      </div>

      {/* Tracking Timeline Stepper */}
      <div className="bg-white rounded-3xl border border-[#E8E3FA] p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="font-display font-bold text-lg text-[#14152D] flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#7444FF]" /> Order Delivery Timeline
        </h2>

        {order.fulfillment.trackingId && (
          <div className="p-3 bg-[#F0EBFF] rounded-2xl text-xs font-medium text-[#7444FF] flex items-center justify-between">
            <span>Carrier: {order.fulfillment.carrier || 'Standard Express'}</span>
            <span className="font-mono font-bold">Tracking ID: {order.fulfillment.trackingId}</span>
          </div>
        )}

        {/* Timeline Events */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8E3FA]">
          {order.timeline.map((event, idx) => (
            <div key={idx} className="relative">
              <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#7444FF] ring-4 ring-white" />
              <div>
                <p className="font-semibold text-sm text-[#14152D]">{event.status}</p>
                <p className="text-xs text-gray-500">{event.note || 'Status updated'}</p>
                <span className="text-[10px] text-gray-400">{formatDateTime(event.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Items & Pricing Card */}
      <div className="bg-white rounded-3xl border border-[#E8E3FA] p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="font-display font-bold text-lg text-[#14152D]">Ordered Merchandise</h2>

        <div className="divide-y divide-gray-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-4 flex items-center gap-4">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-[#14152D] truncate">{item.name}</p>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  SKU: {item.sku} • Quantity: {item.quantity}
                </p>
                <p className="text-xs text-gray-400">Unit Price: {formatINR(item.unitPricePaise)}</p>
              </div>
              <span className="font-bold text-base text-[#14152D]">
                {formatINR(item.lineTotalPaise)}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-gray-100 flex flex-col items-end space-y-1.5 text-sm">
          <div className="flex justify-between w-64 text-gray-600">
            <span>Subtotal:</span>
            <span>{formatINR(order.pricing.subtotalPaise)}</span>
          </div>
          {order.pricing.discountPaise > 0 && (
            <div className="flex justify-between w-64 text-[#FF6B67]">
              <span>Discount ({order.pricing.couponCode || 'Coupon'}):</span>
              <span>-{formatINR(order.pricing.discountPaise)}</span>
            </div>
          )}
          <div className="flex justify-between w-64 text-gray-600">
            <span>Shipping:</span>
            <span>{order.pricing.shippingCostPaise === 0 ? 'FREE' : formatINR(order.pricing.shippingCostPaise)}</span>
          </div>
          <div className="flex justify-between w-64 text-gray-600">
            <span>Tax (GST):</span>
            <span>{formatINR(order.pricing.taxPaise)}</span>
          </div>
          <div className="flex justify-between w-64 pt-2 border-t border-gray-200 font-bold text-base text-[#7444FF]">
            <span>Paid Total:</span>
            <span>{formatINR(order.pricing.totalPaise)}</span>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#14152D]/60 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#FF6B67]">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-display font-bold text-lg text-[#14152D]">Confirm Order Cancellation</h3>
            </div>
            <p className="text-xs text-gray-600">
              Are you sure you want to cancel order <strong>{order.orderReference}</strong>? Inventory items will be restored automatically.
            </p>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">Reason for cancellation:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs outline-none focus:border-[#7444FF]"
              >
                <option value="Change of delivery preference">Change of delivery preference</option>
                <option value="Ordered alternative model/variant">Ordered alternative model/variant</option>
                <option value="Delivery duration too long">Delivery duration too long</option>
                <option value="Accidental order">Accidental order</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowCancelModal(false)}>
                Keep Order
              </Button>
              <Button
                variant="coral"
                size="sm"
                onClick={handleCancelOrder}
                isLoading={isCancelling}
                className="flex-1"
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
