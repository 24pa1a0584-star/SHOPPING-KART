import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICartItem {
  _id?: Types.ObjectId;
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  quantity: number;
  addedAt: Date;
}

export interface ICart extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  guestSessionId?: string;
  items: ICartItem[];
  updatedAt: Date;
  createdAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
  quantity: { type: Number, required: true, min: 1 },
  addedAt: { type: Date, default: Date.now },
});

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', sparse: true, index: true },
    guestSessionId: { type: String, sparse: true, index: true },
    items: [CartItemSchema],
  },
  {
    timestamps: true,
  }
);

CartSchema.index({ userId: 1, guestSessionId: 1 });

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
