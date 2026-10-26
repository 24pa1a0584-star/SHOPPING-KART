import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IVariantOption {
  name: string;
  value: string;
}

export interface IProductVariant extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  sku: string;
  title: string;
  options: IVariantOption[];
  pricePaise: number;
  compareAtPricePaise?: number;
  stock: number;
  reservedStock: number;
  lowStockThreshold: number;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VariantOptionSchema = new Schema<IVariantOption>({
  name: { type: String, required: true },
  value: { type: String, required: true },
});

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    options: [VariantOptionSchema],
    pricePaise: { type: Number, required: true, min: 0 },
    compareAtPricePaise: { type: Number, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    reservedStock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

ProductVariantSchema.index({ productId: 1, isActive: 1 });

export const ProductVariant = mongoose.model<IProductVariant>('ProductVariant', ProductVariantSchema);
