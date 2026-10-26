import React, { useEffect, useState } from 'react';
import { ShoppingBag, Truck, Edit, CheckCircle, Search } from 'lucide-react';
import { api } from '../../services/api';
import { IOrder } from '../../types';
import { formatINR, formatDate, formatDateTime } from '../../lib/utils';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Update Status Modal
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [newStatus, setNewStatus] = useState('CONFIRMED');
  const [carrier, setCarrier] = useState('BlueDart Express');
  const [trackingId, setTrackingId] = useState('');
  const [note, setNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/orders', {
        params: { status: statusFilter || undefined },
      });
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const res = await api.put(`/admin/orders/${selectedOrder._id}/status`, {
        status: newStatus,
        carrier,
        trackingId: trackingId || undefined,
        note: note || undefined,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const openStatusModal = (ord: IOrder) => {
    setSelectedOrder(ord);
    setNewStatus(ord.fulfillment.status);
    setCarrier(ord.fulfillment.carrier || 'Delhivery Logistics');
    setTrackingId(ord.fulfillment.trackingId || `LUM-TRK-${Date.now().toString().slice(-6)}`);
    setNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#14152D]">
            Order Fulfillment Control
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Process orders, assign tracking identifiers, and update timeline stages.
          </p>
        </div>

        {/* Filter by status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-[#E8E3FA] text-[#14152D] text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-[#7444FF] cursor-pointer"
        >
          <option value="">All Fulfillment Statuses</option>
          <option value="PLACED">Placed</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="PACKED">Packed</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#E8E3FA] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF9F1] text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Order Ref</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((ord) => (
                <tr key={ord._id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono font-bold text-[#7444FF]">{ord.orderReference}</td>
                  <td className="p-4">
                    <p className="font-bold text-[#14152D]">{ord.customerName}</p>
                    <p className="text-gray-400 text-[11px]">{ord.customerEmail}</p>
                  </td>
                  <td className="p-4 text-gray-600">{ord.items.length} items</td>
                  <td className="p-4 font-bold text-sm text-[#14152D]">
                    {formatINR(ord.pricing.totalPaise)}
                  </td>
                  <td className="p-4">
                    <Badge variant={ord.payment.status === 'PAID' ? 'mint' : 'coral'} size="sm">
                      {ord.payment.status} ({ord.payment.method})
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant="violet" size="sm">
                      {ord.fulfillment.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-gray-500">{formatDate(ord.createdAt)}</td>
                  <td className="p-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openStatusModal(ord)}
                      leftIcon={<Edit className="w-3.5 h-3.5" />}
                    >
                      Update Status
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Update Order Fulfillment */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#14152D]/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-lg text-[#14152D]">
              Update Status: {selectedOrder.orderReference}
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Fulfillment Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs outline-none focus:border-[#7444FF]"
                >
                  <option value="PLACED">PLACED</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="PACKED">PACKED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Carrier Name</label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g. BlueDart, Delhivery, DTDC"
                  className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Carrier Tracking ID</label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. BD987654321IN"
                  className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Timeline Note</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Dispatched from Bengaluru Central Hub"
                  className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setSelectedOrder(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={isUpdating}>
                  Save & Update Timeline
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
