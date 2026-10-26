import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(60),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  phone: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});

export const addressSchema = z.object({
  name: z.string().min(2, 'Recipient name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  street: z.string().min(3, 'Street address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(5, 'Valid PIN/Postal code is required'),
  country: z.string().default('India'),
  isDefault: z.boolean().default(false),
});

export const addToCartSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID'),
  variantId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Variant ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(20),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative').max(20),
});

export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  paymentMethod: z.enum(['DEMO', 'RAZORPAY', 'COD']),
  couponCode: z.string().trim().optional(),
  shippingMethod: z.enum(['STANDARD', 'EXPRESS']).default('STANDARD'),
  guestEmail: z.string().email().optional(),
  guestName: z.string().min(2).optional(),
  guestPhone: z.string().optional(),
});

export const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, 'Review must be at least 5 characters long').max(1000),
});

export const createProductSchema = z.object({
  name: z.string().min(3).max(120),
  description: z.string().min(10),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  brandId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  images: z.array(z.string()).min(1, 'At least one product image is required'),
  attributes: z.array(z.object({ name: z.string(), value: z.string() })).default([]),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  basePricePaise: z.number().int().min(1),
});

export const createVariantSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  sku: z.string().min(3).max(30),
  title: z.string().min(1),
  options: z.array(z.object({ name: z.string(), value: z.string() })),
  pricePaise: z.number().int().min(1),
  compareAtPricePaise: z.number().int().optional(),
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().default(5),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const createCouponSchema = z.object({
  code: z.string().min(3).max(20),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().min(1),
  minOrderValuePaise: z.number().int().default(0),
  maxDiscountPaise: z.number().int().optional(),
  usageLimit: z.number().int().default(1000),
  perCustomerLimit: z.number().int().default(1),
  validFrom: z.string().or(z.date()).default(() => new Date()),
  validUntil: z.string().or(z.date()),
  isActive: z.boolean().default(true),
});
