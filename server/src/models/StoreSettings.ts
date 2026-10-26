import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStoreSettings extends Document {
  _id: Types.ObjectId;
  storeName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  currencySymbol: string;
  taxRatePercent: number; // e.g. 5% GST
  freeShippingThresholdPaise: number; // e.g. ₹999 (99900 paise)
  standardShippingCostPaise: number; // e.g. ₹70 (7000 paise)
  expressShippingCostPaise: number; // e.g. ₹150 (15000 paise)
  demoMode: boolean;
  updatedAt: Date;
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    storeName: { type: String, default: 'LUMORA' },
    tagline: { type: String, default: 'Discover more. Love every find.' },
    supportEmail: { type: String, default: 'support@lumora.store' },
    supportPhone: { type: String, default: '+91 98765 43210' },
    currency: { type: String, default: 'INR' },
    currencySymbol: { type: String, default: '₹' },
    taxRatePercent: { type: Number, default: 5 }, // 5% GST
    freeShippingThresholdPaise: { type: Number, default: 99900 }, // ₹999
    standardShippingCostPaise: { type: Number, default: 7000 }, // ₹70
    expressShippingCostPaise: { type: Number, default: 15000 }, // ₹150
    demoMode: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const StoreSettings = mongoose.model<IStoreSettings>('StoreSettings', StoreSettingsSchema);
