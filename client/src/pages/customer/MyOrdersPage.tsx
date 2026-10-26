import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Calendar, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { IOrder } from '../../types';
import { formatINR, formatDate } from '../../lib/utils';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const MyOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'mint';
      case 'SHIPPED':
      case 'PACKED':
      case 'PROCESSING':
        return 'violet';
      case 'CANCELLED':
        return 'coral';
      default:
        return 'navy';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#14152D]">
          My Orders & History
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Review past purchases, current delivery timelines, and order receipts.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-36 bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E3FA] p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#F0EBFF] text-[#7444FF] flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-xl text-[#14152D]">No orders placed yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Your shopping journey begins here. Explore our colourful collection!
          </p>
          <Link to="/shop">
            <Button variant="primary">Start Exploring</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-[#E8E3FA] p-5 sm:p-6 shadow-sm hover:shadow-card-hover transition-all space-y-4"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-gray-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-[#7444FF]">
                    {order.orderReference}
                  </span>
                  <Badge variant={getStatusVariant(order.fulfillment.status)} size="sm">
                    {order.fulfillment.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Placed on {formatDate(order.createdAt)}</span>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-x-auto py-1">
                  {order.items.slice(0, 4).map((item, idx) => (
                    <div
                      key={idx}
                      className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <span className="text-xs text-gray-400 font-semibold pl-1">
                      +{order.items.length - 4} more
                    </span>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-gray-400 block">Total Amount</span>
                  <span className="font-display font-bold text-base sm:text-lg text-[#14152D]">
                    {formatINR(order.pricing.totalPaise)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <Link to={`/orders/${order.orderReference}`}>
                  <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                    View Order Details & Tracking
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
