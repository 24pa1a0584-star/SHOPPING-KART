import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { api } from '../../services/api';
import { formatINR, formatDate } from '../../lib/utils';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        if (res.data.success) {
          setData(res.data.analytics);
        }
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-gray-200 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#14152D]">
          Store Management Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Real-time metrics, authoritative revenue calculations, and order fulfillment status.
        </p>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Paid Revenue */}
        <div className="bg-white rounded-3xl border border-[#E8E3FA] p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase">Gross Paid Sales</span>
            <div className="w-8 h-8 rounded-xl bg-[#F0EBFF] text-[#7444FF] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-bold text-2xl text-[#14152D]">
            {formatINR(data.totalRevenuePaise)}
          </div>
          <span className="text-[11px] text-[#25CBB8] font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Authoritative Paid Orders
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl border border-[#E8E3FA] p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-[#FFEBEA] text-[#FF6B67] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-bold text-2xl text-[#14152D]">{data.totalOrders}</div>
          <span className="text-[11px] text-gray-500 font-medium">Recorded in MongoDB</span>
        </div>

        {/* Active Catalog Products */}
        <div className="bg-white rounded-3xl border border-[#E8E3FA] p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase">Published Products</span>
            <div className="w-8 h-8 rounded-xl bg-[#E3FAF7] text-[#25CBB8] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-bold text-2xl text-[#14152D]">{data.totalProducts}</div>
          <span className="text-[11px] text-gray-500 font-medium">Active catalog listings</span>
        </div>

        {/* Low-Stock SKUs */}
        <div className="bg-white rounded-3xl border border-[#E8E3FA] p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500 uppercase">Low Stock SKUs</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-bold text-2xl text-[#14152D]">{data.lowStockCount}</div>
          <span className="text-[11px] text-amber-600 font-bold">
            {data.lowStockCount > 0 ? 'Requires attention' : 'Inventory healthy'}
          </span>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-3xl border border-[#E8E3FA] p-6 shadow-sm space-y-4">
        <h2 className="font-display font-bold text-base text-[#14152D]">
          Recent Revenue Trends (₹)
        </h2>
        <div className="h-64 w-full">
          {data.salesTrend && data.salesTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.salesTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#7444FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7444FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBFF" />
                <XAxis dataKey="date" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7444FF"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-gray-400">
              New sales trend will graph here as paid orders occur.
            </div>
          )}
        </div>
      </div>

      {/* Low Stock SKUs Alert Table */}
      {data.lowStockVariants && data.lowStockVariants.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#E8E3FA] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display font-bold text-base text-[#14152D] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Low-Stock SKUs Alert
            </h2>
            <Link to="/admin/inventory" className="text-xs font-semibold text-[#7444FF] hover:underline">
              Adjust Inventory
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF9F1] text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">SKU</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Variant</th>
                  <th className="p-3">Available Stock</th>
                  <th className="p-3 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.lowStockVariants.map((v: any) => (
                  <tr key={v._id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono font-bold text-[#7444FF]">{v.sku}</td>
                    <td className="p-3 font-medium text-[#14152D]">
                      {typeof v.productId === 'object' ? v.productId.name : 'Product'}
                    </td>
                    <td className="p-3 text-gray-600">{v.title}</td>
                    <td className="p-3">
                      <span className="font-bold text-[#FF6B67]">{v.stock} left</span>
                    </td>
                    <td className="p-3">
                      <Link to="/admin/inventory">
                        <Button variant="outline" size="sm">
                          Restock
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-[#E8E3FA] p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-display font-bold text-base text-[#14152D]">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs font-semibold text-[#7444FF] hover:underline">
            View All Orders
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF9F1] text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-3 rounded-l-xl">Order Ref</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Fulfillment</th>
                <th className="p-3 rounded-r-xl">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.recentOrders.map((ord: any) => (
                <tr key={ord._id} className="hover:bg-gray-50">
                  <td className="p-3 font-mono font-bold text-[#7444FF]">
                    <Link to={`/orders/${ord.orderReference}`}>{ord.orderReference}</Link>
                  </td>
                  <td className="p-3 font-medium text-[#14152D]">{ord.customerName}</td>
                  <td className="p-3 font-semibold">{formatINR(ord.pricing?.totalPaise)}</td>
                  <td className="p-3">
                    <Badge variant={ord.payment?.status === 'PAID' ? 'mint' : 'coral'} size="sm">
                      {ord.payment?.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant="violet" size="sm">
                      {ord.fulfillment?.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-gray-500">{formatDate(ord.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
