import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Truck, Home } from 'lucide-react';
import { api } from '../../services/api';
import { IOrder } from '../../types';
import { formatINR } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const OrderConfirmationPage: React.FC = () => {
  const { orderReference } = useParams<{ orderReference: string }>();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderReference}`);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Failed to load order confirmation:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderReference) {
      fetchOrder();
    }
  }, [orderReference]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-[#E3FAF7] text-[#25CBB8] flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#14152D]">
          Thank You! Order Confirmed
        </h1>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Your order has been safely placed and recorded in our database. We've sent an email receipt to{' '}
          <strong className="text-[#14152D]">{order?.customerEmail || 'your email'}</strong>.
        </p>

        {/* Order Reference Badge */}
        <div className="inline-flex items-center gap-2 bg-[#F0EBFF] px-4 py-2 rounded-2xl border border-[#7444FF]/20 mt-2">
          <span className="text-xs text-gray-500 font-medium">Order Number:</span>
          <span className="font-mono font-bold text-sm text-[#7444FF]">{orderReference}</span>
        </div>
      </div>

      {/* Order Details Card */}
      {order && (
        <div className="bg-white rounded-3xl border border-[#E8E3FA] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs text-gray-400 font-semibold uppercase">Fulfillment Status</span>
              <div className="mt-1">
                <Badge variant="mint" size="md">
                  {order.fulfillment.status}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 font-semibold uppercase">Payment Status</span>
              <div className="mt-1">
                <Badge variant={order.payment.status === 'PAID' ? 'mint' : 'coral'} size="md">
                  {order.payment.status} ({order.payment.method})
                </Badge>
              </div>
            </div>
          </div>

          {/* Ordered Items */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Ordered Items
            </h3>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-[#14152D] truncate">{item.name}</p>
                    <p className="text-[11px] text-gray-400 font-mono">
                      SKU: {item.sku} • Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#14152D]">
                    {formatINR(item.lineTotalPaise)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Billing Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
            <div>
              <span className="font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Shipping Destination:
              </span>
              <p className="font-bold text-[#14152D]">{order.shippingAddress.name}</p>
              <p className="text-gray-600">{order.shippingAddress.street}</p>
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </p>
              <p className="text-gray-600">Phone: {order.shippingAddress.phone}</p>
            </div>

            <div className="space-y-1.5 sm:text-right">
              <span className="font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Payment Summary:
              </span>
              <p className="text-gray-600">Subtotal: {formatINR(order.pricing.subtotalPaise)}</p>
              {order.pricing.discountPaise > 0 && (
                <p className="text-[#FF6B67]">Discount: -{formatINR(order.pricing.discountPaise)}</p>
              )}
              <p className="text-gray-600">Shipping: {order.pricing.shippingCostPaise === 0 ? 'FREE' : formatINR(order.pricing.shippingCostPaise)}</p>
              <p className="font-bold text-sm text-[#7444FF] pt-1">
                Paid Total: {formatINR(order.pricing.totalPaise)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link to={`/orders/${orderReference}`}>
          <Button variant="primary" size="md" leftIcon={<Truck className="w-4 h-4" />}>
            Track Order Status
          </Button>
        </Link>
        <Link to="/shop">
          <Button variant="outline" size="md" leftIcon={<Home className="w-4 h-4" />}>
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};
