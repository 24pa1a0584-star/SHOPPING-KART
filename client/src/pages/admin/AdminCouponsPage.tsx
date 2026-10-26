import React, { useEffect, useState } from 'react';
import { Tag, Plus, CheckCircle, Percent, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { ICoupon } from '../../types';
import { formatINR, formatDate } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { toast } from 'sonner';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 15,
    minOrderValueRupees: 999,
    maxDiscountRupees: 500,
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/coupons');
      if (res.data.success) {
        setCoupons(res.data.coupons);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return;

    try {
      const res = await api.post('/admin/coupons', {
        code: newCoupon.code.toUpperCase(),
        discountType: newCoupon.discountType,
        discountValue:
          newCoupon.discountType === 'percentage'
            ? newCoupon.discountValue
            : newCoupon.discountValue * 100, // paise
        minOrderValuePaise: Math.round(newCoupon.minOrderValueRupees * 100),
        maxDiscountPaise: newCoupon.maxDiscountRupees ? Math.round(newCoupon.maxDiscountRupees * 100) : undefined,
        validUntil: new Date(newCoupon.validUntil),
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setShowAddModal(false);
        fetchCoupons();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#14152D]">
            Discounts & Promo Coupons
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure promotional codes, percentage savings, and server-side minimum order validation.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddModal(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create New Coupon
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-[#E8E3FA] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF9F1] text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Type</th>
                <th className="p-4">Discount Value</th>
                <th className="p-4">Min Order Value</th>
                <th className="p-4">Usage Count</th>
                <th className="p-4">Valid Until</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono font-bold text-[#7444FF]">{c.code}</td>
                  <td className="p-4 font-medium uppercase text-gray-600">{c.discountType}</td>
                  <td className="p-4 font-bold text-sm text-[#14152D]">
                    {c.discountType === 'percentage'
                      ? `${c.discountValue}% Off`
                      : formatINR(c.discountValue)}
                  </td>
                  <td className="p-4">{formatINR(c.minOrderValuePaise)}</td>
                  <td className="p-4 text-gray-600">
                    {c.usedCount} / {c.usageLimit}
                  </td>
                  <td className="p-4 text-gray-500">{formatDate(c.validUntil)}</td>
                  <td className="p-4">
                    <Badge variant={c.isActive ? 'mint' : 'gray'} size="sm">
                      {c.isActive ? 'Active' : 'Disabled'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Coupon */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#14152D]/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-lg text-[#14152D]">Create Promo Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH25"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs font-mono uppercase outline-none focus:border-[#7444FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e: any) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                    className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                    className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newCoupon.minOrderValueRupees}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValueRupees: Number(e.target.value) })}
                    className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Valid Until</label>
                  <input
                    type="date"
                    required
                    value={newCoupon.validUntil}
                    onChange={(e) => setNewCoupon({ ...newCoupon, validUntil: e.target.value })}
                    className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Coupon
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
