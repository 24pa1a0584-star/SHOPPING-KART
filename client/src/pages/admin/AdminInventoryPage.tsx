import React, { useEffect, useState } from 'react';
import { Boxes, Edit, AlertTriangle, ArrowUpDown, History } from 'lucide-react';
import { api } from '../../services/api';
import { IProductVariant } from '../../types';
import { formatINR } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { toast } from 'sonner';

export const AdminInventoryPage: React.FC = () => {
  const [variants, setVariants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Adjustment Modal
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [reason, setReason] = useState<string>('Restock from warehouse arrival');
  const [isAdjusting, setIsAdjusting] = useState(false);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/products');
      if (res.data.success) {
        // Flatten variants across all products
        const allVariants = res.data.products.flatMap((p: any) =>
          (p.variants || []).map((v: any) => ({
            ...v,
            productName: p.name,
            productSlug: p.slug,
          }))
        );
        setVariants(allVariants);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;
    setIsAdjusting(true);
    try {
      const res = await api.put(`/admin/variants/${selectedVariant._id}/stock`, {
        stock: newStock,
        reason,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setSelectedVariant(null);
        fetchInventory();
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsAdjusting(false);
    }
  };

  const openAdjustModal = (v: any) => {
    setSelectedVariant(v);
    setNewStock(v.stock);
    setReason('Warehouse batch stock replenishment');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#14152D]">
          Inventory & Stock Management
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Atomic inventory tracking with complete audit trail and zero-overselling guarantees.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E8E3FA] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF9F1] text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">SKU Code</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Variant Title</th>
                <th className="p-4">Unit Price</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {variants.map((v) => (
                <tr key={v._id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono font-bold text-[#7444FF]">{v.sku}</td>
                  <td className="p-4 font-bold text-[#14152D]">{v.productName}</td>
                  <td className="p-4 text-gray-600">{v.title}</td>
                  <td className="p-4 font-semibold">{formatINR(v.pricePaise)}</td>
                  <td className="p-4">
                    <span
                      className={`font-display font-bold text-sm ${
                        v.stock <= 5 ? 'text-[#FF6B67]' : 'text-[#25CBB8]'
                      }`}
                    >
                      {v.stock} units
                    </span>
                  </td>
                  <td className="p-4">
                    {v.stock === 0 ? (
                      <Badge variant="coral" size="sm">
                        Out of Stock
                      </Badge>
                    ) : v.stock <= 5 ? (
                      <Badge variant="lime" size="sm">
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge variant="mint" size="sm">
                        Healthy
                      </Badge>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAdjustModal(v)}
                      leftIcon={<Edit className="w-3.5 h-3.5" />}
                    >
                      Adjust Stock
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {selectedVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#14152D]/60 backdrop-blur-sm" onClick={() => setSelectedVariant(null)} />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-lg text-[#14152D]">
              Adjust Stock: {selectedVariant.sku}
            </h3>
            <p className="text-xs text-gray-500">
              {selectedVariant.productName} ({selectedVariant.title})
            </p>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  New Available Stock (Units)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-sm font-bold text-[#14152D] outline-none focus:border-[#7444FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Audit Reason
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Warehouse delivery batch #842"
                  className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs outline-none focus:border-[#7444FF]"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setSelectedVariant(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={isAdjusting}>
                  Save Stock Adjustment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
