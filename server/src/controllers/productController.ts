import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { ProductVariant } from '../models/ProductVariant';
import { Category } from '../models/Category';
import { Brand } from '../models/Brand';

export const listProducts = async (req: Request, res: Response): Promise<void> => {
  const {
    page = '1',
    limit = '12',
    category,
    brand,
    search,
    minPrice,
    maxPrice,
    sort = 'newest',
    featured,
    inStock,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const query: any = { isPublished: true };

  // Category filter: could be category slug or ObjectId
  if (category && category !== 'all') {
    if (mongoose.Types.ObjectId.isValid(category as string)) {
      query.categoryId = category;
    } else {
      const catDoc = await Category.findOne({ slug: category as string });
      if (catDoc) {
        query.categoryId = catDoc._id;
      } else {
        res.status(200).json({
          success: true,
          products: [],
          pagination: { total: 0, page: pageNum, limit: limitNum, pages: 0 },
        });
        return;
      }
    }
  }

  // Brand filter
  if (brand && brand !== 'all') {
    if (mongoose.Types.ObjectId.isValid(brand as string)) {
      query.brandId = brand;
    } else {
      const brandDoc = await Brand.findOne({ slug: brand as string });
      if (brandDoc) {
        query.brandId = brandDoc._id;
      }
    }
  }

  // Featured filter
  if (featured === 'true') {
    query.isFeatured = true;
  }

  // Price filter (convert incoming rupee values to paise if needed)
  if (minPrice || maxPrice) {
    query.basePricePaise = {};
    if (minPrice) {
      query.basePricePaise.$gte = parseInt(minPrice as string, 10) * 100;
    }
    if (maxPrice) {
      query.basePricePaise.$lte = parseInt(maxPrice as string, 10) * 100;
    }
  }

  // Search filter
  if (search && typeof search === 'string' && search.trim()) {
    const cleanSearch = search.trim();
    query.$or = [
      { name: { $regex: cleanSearch, $options: 'i' } },
      { description: { $regex: cleanSearch, $options: 'i' } },
      { tags: { $in: [new RegExp(cleanSearch, 'i')] } },
    ];
  }

  // Sorting
  let sortOption: any = { createdAt: -1 };
  if (sort === 'price_asc') {
    sortOption = { basePricePaise: 1 };
  } else if (sort === 'price_desc') {
    sortOption = { basePricePaise: -1 };
  } else if (sort === 'rating') {
    sortOption = { ratingAverage: -1, ratingCount: -1 };
  } else if (sort === 'popular') {
    sortOption = { ratingCount: -1 };
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('categoryId', 'name slug')
      .populate('brandId', 'name slug logo')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(query),
  ]);

  // Attach variant counts and min/max variant pricing
  const productIds = products.map((p) => p._id);
  const variants = await ProductVariant.find({
    productId: { $in: productIds },
    isActive: true,
  }).lean();

  const variantMap = new Map<string, any[]>();
  variants.forEach((v) => {
    const pId = v.productId.toString();
    if (!variantMap.has(pId)) {
      variantMap.set(pId, []);
    }
    variantMap.get(pId)?.push(v);
  });

  const enrichedProducts = products.map((product) => {
    const pVariants = variantMap.get(product._id.toString()) || [];
    const totalStock = pVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
    const minPrice = pVariants.length > 0
      ? Math.min(...pVariants.map((v) => v.pricePaise))
      : product.basePricePaise;
    const maxPrice = pVariants.length > 0
      ? Math.max(...pVariants.map((v) => v.pricePaise))
      : product.basePricePaise;

    return {
      ...product,
      variants: pVariants,
      variantCount: pVariants.length,
      totalStock,
      minPricePaise: minPrice,
      maxPricePaise: maxPrice,
    };
  });

  // Filter inStock if requested
  const finalProducts = inStock === 'true'
    ? enrichedProducts.filter((p) => p.totalStock > 0)
    : enrichedProducts;

  res.status(200).json({
    success: true,
    products: finalProducts,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;

  const product = await Product.findOne({ slug, isPublished: true })
    .populate('categoryId', 'name slug description')
    .populate('brandId', 'name slug logo description')
    .lean();

  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found.' });
    return;
  }

  const variants = await ProductVariant.find({
    productId: product._id,
    isActive: true,
  }).lean();

  // Find related products in same category
  const related = await Product.find({
    categoryId: product.categoryId,
    _id: { $ne: product._id },
    isPublished: true,
  })
    .limit(4)
    .lean();

  res.status(200).json({
    success: true,
    product: {
      ...product,
      variants,
    },
    related,
  });
};

export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
  const featured = await Product.find({ isPublished: true, isFeatured: true })
    .populate('categoryId', 'name slug')
    .limit(8)
    .lean();

  const productIds = featured.map((p) => p._id);
  const variants = await ProductVariant.find({
    productId: { $in: productIds },
    isActive: true,
  }).lean();

  const variantMap = new Map<string, any[]>();
  variants.forEach((v) => {
    const pId = v.productId.toString();
    if (!variantMap.has(pId)) variantMap.set(pId, []);
    variantMap.get(pId)?.push(v);
  });

  const enriched = featured.map((p) => {
    const pVars = variantMap.get(p._id.toString()) || [];
    const minPrice = pVars.length > 0 ? Math.min(...pVars.map((v) => v.pricePaise)) : p.basePricePaise;
    return {
      ...p,
      variants: pVars,
      minPricePaise: minPrice,
    };
  });

  res.status(200).json({ success: true, products: enriched });
};

export const listCategories = async (req: Request, res: Response): Promise<void> => {
  const categories = await Category.find({ isActive: true })
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  // Attach product counts to each category
  const counts = await Product.aggregate([
    { $match: { isPublished: true } },
    { $group: { _id: '$categoryId', count: { $sum: 1 } } },
  ]);

  const countMap = new Map<string, number>();
  counts.forEach((c) => countMap.set(c._id.toString(), c.count));

  const enrichedCategories = categories.map((cat) => ({
    ...cat,
    productCount: countMap.get(cat._id.toString()) || 0,
  }));

  res.status(200).json({ success: true, categories: enrichedCategories });
};

export const listBrands = async (req: Request, res: Response): Promise<void> => {
  const brands = await Brand.find({ isActive: true }).sort({ name: 1 }).lean();
  res.status(200).json({ success: true, brands });
};
