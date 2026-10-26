import { ProductVariant } from '../models/ProductVariant';
import { InventoryMovement } from '../models/InventoryMovement';

export interface StockDeductionRequest {
  variantId: string;
  quantity: number;
}

export class InventoryService {
  /**
   * Atomically deduct stock for multiple items.
   * If any item lacks sufficient stock, all already deducted items in this batch
   * are immediately compensated/restored, and an error is thrown.
   * This guarantees atomic consistency and prevents overselling.
   */
  static async deductStockAtomically(
    items: StockDeductionRequest[],
    orderReference: string
  ): Promise<void> {
    const successfullyDeducted: { variantId: string; quantity: number }[] = [];

    for (const item of items) {
      // Atomic conditional decrement in MongoDB:
      // only succeeds if current stock >= item.quantity
      const updatedVariant = await ProductVariant.findOneAndUpdate(
        {
          _id: item.variantId,
          stock: { $gte: item.quantity },
          isActive: true,
        },
        {
          $inc: { stock: -item.quantity },
        },
        {
          new: true,
        }
      );

      if (!updatedVariant) {
        // Find variant to formulate informative error
        const variant = await ProductVariant.findById(item.variantId);
        const available = variant ? variant.stock : 0;
        const sku = variant ? variant.sku : item.variantId;

        // Roll back previously deducted items in this transaction
        await this.restoreStock(successfullyDeducted, orderReference, 'ROLLBACK_FAILED_CHECKOUT');

        throw new Error(
          `Insufficient stock for item (${sku}). Requested: ${item.quantity}, Available: ${available}`
        );
      }

      // Record successful deduction
      successfullyDeducted.push({ variantId: item.variantId, quantity: item.quantity });

      // Audit movement
      await InventoryMovement.create({
        variantId: updatedVariant._id,
        sku: updatedVariant.sku,
        type: 'PURCHASE',
        quantityChange: -item.quantity,
        previousStock: updatedVariant.stock + item.quantity,
        newStock: updatedVariant.stock,
        referenceId: orderReference,
        reason: `Checkout purchase for order ${orderReference}`,
      });
    }
  }

  /**
   * Restore stock (for cancellations or rollback)
   */
  static async restoreStock(
    items: { variantId: string; quantity: number }[],
    referenceId: string,
    reason: string
  ): Promise<void> {
    for (const item of items) {
      const updated = await ProductVariant.findByIdAndUpdate(
        item.variantId,
        { $inc: { stock: item.quantity } },
        { new: true }
      );

      if (updated) {
        await InventoryMovement.create({
          variantId: updated._id,
          sku: updated.sku,
          type: 'CANCELLATION',
          quantityChange: item.quantity,
          previousStock: updated.stock - item.quantity,
          newStock: updated.stock,
          referenceId,
          reason,
        });
      }
    }
  }

  /**
   * Admin manual stock adjustment
   */
  static async adjustStock(
    variantId: string,
    newStock: number,
    adminEmail: string,
    reason?: string
  ): Promise<{ previousStock: number; newStock: number; sku: string }> {
    if (newStock < 0) {
      throw new Error('Stock cannot be negative.');
    }

    const variant = await ProductVariant.findById(variantId);
    if (!variant) {
      throw new Error('Product variant not found.');
    }

    const previousStock = variant.stock;
    const diff = newStock - previousStock;

    variant.stock = newStock;
    await variant.save();

    await InventoryMovement.create({
      variantId: variant._id,
      sku: variant.sku,
      type: 'ADJUSTMENT',
      quantityChange: diff,
      previousStock,
      newStock,
      referenceId: adminEmail,
      reason: reason || `Manual adjustment by admin ${adminEmail}`,
    });

    return { previousStock, newStock, sku: variant.sku };
  }
}
