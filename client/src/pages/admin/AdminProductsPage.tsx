import React, { useEffect, useState } from 'react';
import { Package, Plus, Edit, Layers, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { IProduct, ICategory } from '../../types';
import { formatINR } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { toast } from 'sonner';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Product Modal
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    categoryId: '',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
    basePriceRupees: 1999,
    isFeatured: false,
  });

  // New Variant Modal
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [newVariant, setNewVariant] = useState({
    sku: '',
    title: '',
    optionName: 'Color',
    optionValue: 'Charcoal',
    priceRupees: 1999,
    stock: 20,
  });

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/products/categories'),
      ]);
      if (prodRes.data.success) setProducts(prodRes.data.products);
      if (catRes.data.success) {
        setCategories(catRes.data.categories);
        if (catRes.data.categories.length > 0 && !newProduct.categoryId) {
          setNewProduct((prev) => ({ ...prev, categoryId: catRes.data.categories[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.categoryId) {
      toast.error('Please fill product name and select a category.');
      return;
    }

    try {
      const res = await api.post('/admin/products', {
        name: newProduct.name,
        description: newProduct.description || 'Premium curated collection item.',
        categoryId: newProduct.categoryId,
        images: newProduct.images,
        basePricePaise: Math.round(newProduct.basePriceRupees * 100),
        isFeatured: newProduct.isFeatured,
      });

      if (res.data.success) {
        toast.success('Product created successfully!');
        setShowAddProduct(false);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVariant.sku || !newVariant.title) {
      toast.error('Please enter variant title and SKU.');
      return;
    }

    try {
      const res = await api.post('/admin/variants', {
        productId: selectedProductId,
        sku: newVariant.sku.toUpperCase(),
        title: newVariant.title,
        options: [{ name: newVariant.optionName, value: newVariant.optionValue }],
        pricePaise: Math.round(newVariant.priceRupees * 100),
        stock: newVariant.stock,
      });

      if (res.data.success) {
        toast.success('Variant created and inventory initialized!');
        setShowAddVariant(false);
        fetchData();
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
            Product Catalog Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Create products, configure options, and manage variants with real database persistence.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddProduct(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Product
        </Button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-[#E8E3FA] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF9F1] text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Base Price</th>
                <th className="p-4">Variants</th>
                <th className="p-4">Total Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                    />
                    <div>
                      <p className="font-bold text-sm text-[#14152D]">{p.name}</p>
                      <p className="text-[11px] text-gray-400 font-mono">slug: {p.slug}</p>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-600">
                    {typeof p.categoryId === 'object' ? p.categoryId.name : 'Category'}
                  </td>
                  <td className="p-4 font-semibold text-[#14152D]">{formatINR(p.basePricePaise)}</td>
                  <td className="p-4">
                    <span className="font-bold text-[#7444FF] bg-[#F0EBFF] px-2 py-1 rounded-lg">
                      {p.variants?.length || 0} variants
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`font-bold ${
                        p.totalStock <= 5 ? 'text-[#FF6B67]' : 'text-[#25CBB8]'
                      }`}
                    >
                      {p.totalStock} units
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge variant={p.isPublished ? 'mint' : 'gray'} size="sm">
                      {p.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProductId(p._id);
                        setShowAddVariant(true);
                      }}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add Variant
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Product */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#14152D]/60 backdrop-blur-sm" onClick={() => setShowAddProduct(false)} />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-bold text-lg text-[#14152D]">Add New Product to Catalog</h3>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lumora Horizon Ceramic Lamp"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs outline-none focus:border-[#7444FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category</label>
                <select
                  value={newProduct.categoryId}
                  onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                  className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs outline-none focus:border-[#7444FF]"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Base Price in Rupees (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newProduct.basePriceRupees}
                  onChange={(e) => setNewProduct({ ...newProduct, basePriceRupees: Number(e.target.value) })}
                  className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs outline-none focus:border-[#7444FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Describe materials, acoustics, fit, or aesthetic appeal..."
                  className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs outline-none focus:border-[#7444FF]"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddProduct(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Create Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Variant */}
      {showAddVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#14152D]/60 backdrop-blur-sm" onClick={() => setShowAddVariant(false)} />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-display font-bold text-lg text-[#14152D]">Add Product Variant</h3>
            <form onSubmit={handleCreateVariant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">SKU Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LUM-FSH-002-BLU-L"
                  value={newVariant.sku}
                  onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value.toUpperCase() })}
                  className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs font-mono uppercase outline-none focus:border-[#7444FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Variant Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cobalt Blue / L"
                  value={newVariant.title}
                  onChange={(e) => setNewVariant({ ...newVariant, title: e.target.value })}
                  className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs outline-none focus:border-[#7444FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newVariant.priceRupees}
                    onChange={(e) => setNewVariant({ ...newVariant, priceRupees: Number(e.target.value) })}
                    className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newVariant.stock}
                    onChange={(e) => setNewVariant({ ...newVariant, stock: Number(e.target.value) })}
                    className="w-full bg-[#FFF9F1] border border-[#E8E3FA] rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddVariant(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Variant
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
