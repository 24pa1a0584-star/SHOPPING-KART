import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICoupon extends Document {
  _id: Types.ObjectId;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // percentage (e.g. 15 for 15%) or fixed in paise (e.g. 50000 for ₹500)
  minOrderValuePaise: number;
  maxDiscountPaise?: number; // Cap for percentage discount
  usageLimit: number;
  perCustomerLimit: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 1 },
    minOrderValuePaise: { type: Number, default: 0, min: 0 },
    maxDiscountPaise: { type: Number, min: 0 },
    usageLimit: { type: Number, default: 1000 },
    perCustomerLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
