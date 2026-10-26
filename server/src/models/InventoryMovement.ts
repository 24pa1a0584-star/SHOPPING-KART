import mongoose, { Document, Schema, Types } from 'mongoose';

export type MovementType = 'PURCHASE' | 'RESTOCK' | 'CANCELLATION' | 'ADJUSTMENT' | 'RESERVATION';

export interface IInventoryMovement extends Document {
  _id: Types.ObjectId;
  variantId: Types.ObjectId;
  sku: string;
  type: MovementType;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  referenceId?: string; // Order reference or Admin Adjustment ID
  reason?: string;
  createdAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    variantId: { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true, index: true },
    sku: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['PURCHASE', 'RESTOCK', 'CANCELLATION', 'ADJUSTMENT', 'RESERVATION'],
      required: true,
    },
    quantityChange: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    referenceId: { type: String },
    reason: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

InventoryMovementSchema.index({ sku: 1, createdAt: -1 });

export const InventoryMovement = mongoose.model<IInventoryMovement>('InventoryMovement', InventoryMovementSchema);
