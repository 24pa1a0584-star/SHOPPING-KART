import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProductAttribute {
  name: string;
  value: string;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  categoryId: Types.ObjectId;
  brandId?: Types.ObjectId;
  images: string[];
  attributes: IProductAttribute[];
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  basePricePaise: number;
  ratingAverage: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductAttributeSchema = new Schema<IProductAttribute>({
  name: { type: String, required: true },
  value: { type: String, required: true },
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand' },
    images: [{ type: String }],
    attributes: [ProductAttributeSchema],
    tags: [{ type: String, lowercase: true, trim: true }],
    isPublished: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    basePricePaise: { type: Number, required: true }, // in Indian paise
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Text index for search functionality
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
