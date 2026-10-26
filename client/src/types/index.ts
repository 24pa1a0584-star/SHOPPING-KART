export interface IUserAddress {
  _id?: string;
  name: string;
  phone: string;
  street: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  addresses: IUserAddress[];
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  productCount?: number;
}

export interface IBrand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
}

export interface IVariantOption {
  name: string;
  value: string;
}

export interface IProductVariant {
  _id: string;
  productId: string;
  sku: string;
  title: string;
  options: IVariantOption[];
  pricePaise: number;
  compareAtPricePaise?: number;
  stock: number;
  reservedStock?: number;
  lowStockThreshold?: number;
  images: string[];
  isActive: boolean;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: ICategory | string;
  brandId?: IBrand | string;
  images: string[];
  attributes: { name: string; value: string }[];
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  basePricePaise: number;
  ratingAverage: number;
  ratingCount: number;
  variants?: IProductVariant[];
  variantCount?: number;
  totalStock?: number;
  minPricePaise?: number;
  maxPricePaise?: number;
  createdAt: string;
}

export interface ICartItemEnriched {
  _id: string;
  productId: string;
  variantId: string;
  productName: string;
  productSlug: string;
  variantTitle: string;
  sku: string;
  options: IVariantOption[];
  unitPricePaise: number;
  compareAtPricePaise?: number;
  quantity: number;
  lineTotalPaise: number;
  image: string;
  stock: number;
  isAvailable: boolean;
}

export interface ICart {
  _id: string;
  userId?: string;
  guestSessionId?: string;
  items: ICartItemEnriched[];
  itemCount: number;
  subtotalPaise: number;
  hasStockIssues: boolean;
  updatedAt: string;
}

export interface IPricingQuote {
  items: any[];
  subtotalPaise: number;
  discountPaise: number;
  appliedCoupon?: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
  };
  shippingCostPaise: number;
  taxPaise: number;
  totalPaise: number;
  currency: string;
}

export interface IOrderItem {
  productId: string;
  variantId: string;
  name: string;
  sku: string;
  options: IVariantOption[];
  unitPricePaise: number;
  quantity: number;
  lineTotalPaise: number;
  image?: string;
}

export interface IOrderTimeline {
  status: string;
  timestamp: string;
  note?: string;
}

export interface IOrder {
  _id: string;
  orderReference: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: IOrderItem[];
  shippingAddress: IUserAddress;
  pricing: {
    subtotalPaise: number;
    discountPaise: number;
    couponCode?: string;
    shippingCostPaise: number;
    taxPaise: number;
    totalPaise: number;
  };
  payment: {
    method: 'DEMO' | 'RAZORPAY' | 'COD';
    status: 'NOT_REQUIRED' | 'PENDING' | 'AUTHORIZED' | 'PAID' | 'FAILED' | 'REFUNDED';
    transactionId?: string;
    verifiedAt?: string;
  };
  fulfillment: {
    status: 'PLACED' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED' | 'RETURNED';
    trackingId?: string;
    carrier?: string;
    shippedAt?: string;
    deliveredAt?: string;
    notes?: string;
  };
  timeline: IOrderTimeline[];
  createdAt: string;
  updatedAt: string;
}

export interface ICoupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValuePaise: number;
  maxDiscountPaise?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export interface IReview {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}
