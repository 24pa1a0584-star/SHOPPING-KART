import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOrderItemSnapshot {
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  name: string;
  sku: string;
  options: { name: string; value: string }[];
  unitPricePaise: number;
  quantity: number;
  lineTotalPaise: number;
  image?: string;
}

export interface IOrderTimeline {
  status: string;
  timestamp: Date;
  note?: string;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderReference: string;
  customerId?: Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: IOrderItemSnapshot[];
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
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
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    verifiedAt?: Date;
  };
  fulfillment: {
    status: 'PLACED' | 'CONFIRMED' | 'PROCESSING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED' | 'RETURNED';
    trackingId?: string;
    carrier?: string;
    shippedAt?: Date;
    deliveredAt?: Date;
    notes?: string;
  };
  timeline: IOrderTimeline[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSnapshotSchema = new Schema<IOrderItemSnapshot>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  options: [{ name: { type: String }, value: { type: String } }],
  unitPricePaise: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  lineTotalPaise: { type: Number, required: true },
  image: { type: String },
});

const OrderTimelineSchema = new Schema<IOrderTimeline>({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderReference: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', sparse: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    customerPhone: { type: String, required: true, trim: true },
    items: [OrderItemSnapshotSchema],
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    pricing: {
      subtotalPaise: { type: Number, required: true, min: 0 },
      discountPaise: { type: Number, default: 0, min: 0 },
      couponCode: { type: String, uppercase: true },
      shippingCostPaise: { type: Number, default: 0, min: 0 },
      taxPaise: { type: Number, default: 0, min: 0 },
      totalPaise: { type: Number, required: true, min: 0 },
    },
    payment: {
      method: { type: String, enum: ['DEMO', 'RAZORPAY', 'COD'], required: true },
      status: {
        type: String,
        enum: ['NOT_REQUIRED', 'PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED'],
        default: 'PENDING',
        index: true,
      },
      transactionId: { type: String },
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      verifiedAt: { type: Date },
    },
    fulfillment: {
      status: {
        type: String,
        enum: ['PLACED', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED'],
        default: 'PLACED',
        index: true,
      },
      trackingId: { type: String },
      carrier: { type: String },
      shippedAt: { type: Date },
      deliveredAt: { type: Date },
      notes: { type: String },
    },
    timeline: [OrderTimelineSchema],
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ customerId: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
