import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWishlist extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  guestSessionId?: string;
  productIds: Types.ObjectId[];
  updatedAt: Date;
  createdAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', sparse: true, index: true },
    guestSessionId: { type: String, sparse: true, index: true },
    productIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  {
    timestamps: true,
  }
);

WishlistSchema.index({ userId: 1, guestSessionId: 1 });

export const Wishlist = mongoose.model<IWishlist>('Wishlist', WishlistSchema);
