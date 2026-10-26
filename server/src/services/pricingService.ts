import { Coupon, ICoupon } from '../models/Coupon';
import { StoreSettings } from '../models/StoreSettings';
import { ProductVariant, IProductVariant } from '../models/ProductVariant';

export interface CartItemInput {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface QuoteItem {
  productId: string;
  variantId: string;
  name: string;
  sku: string;
  options: { name: string; value: string }[];
  unitPricePaise: number;
  compareAtPricePaise?: number;
  quantity: number;
  lineTotalPaise: number;
  image?: string;
  stockAvailable: number;
}

export interface PricingQuote {
  items: QuoteItem[];
  subtotalPaise: number;
  discountPaise: number;
  appliedCoupon?: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
  };
  shippingCostPaise: number;
  taxPaise: number;
  totalPaise: number;
  currency: string;
}

export class PricingService {
  /**
   * Authoritatively calculate prices from server database.
   * NEVER trust client prices.
   */
  static async calculateQuote(
    rawItems: CartItemInput[],
    couponCode?: string,
    shippingMethod: 'STANDARD' | 'EXPRESS' = 'STANDARD'
  ): Promise<PricingQuote> {
    if (!rawItems || rawItems.length === 0) {
      throw new Error('Cannot calculate quote for an empty cart.');
    }

    // Load store settings
    const settings = await StoreSettings.findOne().lean() || {
      currency: 'INR',
      taxRatePercent: 5,
      freeShippingThresholdPaise: 99900, // ₹999
      standardShippingCostPaise: 7000,  // ₹70
      expressShippingCostPaise: 15000,  // ₹150
    };

    let subtotalPaise = 0;
    const items: QuoteItem[] = [];

    for (const item of rawItems) {
      const variant = await ProductVariant.findById(item.variantId).populate('productId');
      if (!variant || !variant.isActive) {
        throw new Error(`Product variant not found or inactive for variant ID: ${item.variantId}`);
      }

      const product = variant.productId as any;
      if (!product || !product.isPublished) {
        throw new Error(`Product is no longer available for variant: ${variant.title}`);
      }

      if (variant.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name} - ${variant.title}". Available: ${variant.stock}, requested: ${item.quantity}`
        );
      }

      const unitPricePaise = variant.pricePaise;
      const lineTotalPaise = unitPricePaise * item.quantity;
      subtotalPaise += lineTotalPaise;

      const primaryImage =
        variant.images && variant.images.length > 0
          ? variant.images[0]
          : product.images && product.images.length > 0
          ? product.images[0]
          : '';

      items.push({
        productId: product._id.toString(),
        variantId: variant._id.toString(),
        name: product.name,
        sku: variant.sku,
        options: variant.options,
        unitPricePaise,
        compareAtPricePaise: variant.compareAtPricePaise,
        quantity: item.quantity,
        lineTotalPaise,
        image: primaryImage,
        stockAvailable: variant.stock,
      });
    }

    // Coupon validation and discount calculation
    let discountPaise = 0;
    let appliedCouponInfo: PricingQuote['appliedCoupon'] = undefined;

    if (couponCode && couponCode.trim()) {
      const cleanCode = couponCode.trim().toUpperCase();
      const now = new Date();
      const coupon = await Coupon.findOne({
        code: cleanCode,
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now },
      });

      if (!coupon) {
        throw new Error(`Coupon "${cleanCode}" is invalid or expired.`);
      }

      if (subtotalPaise < coupon.minOrderValuePaise) {
        const minReq = (coupon.minOrderValuePaise / 100).toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
        });
        throw new Error(`Coupon "${cleanCode}" requires a minimum order value of ${minReq}.`);
      }

      if (coupon.usedCount >= coupon.usageLimit) {
        throw new Error(`Coupon "${cleanCode}" has reached its maximum usage limit.`);
      }

      if (coupon.discountType === 'percentage') {
        let calculated = Math.round((subtotalPaise * coupon.discountValue) / 100);
        if (coupon.maxDiscountPaise && calculated > coupon.maxDiscountPaise) {
          calculated = coupon.maxDiscountPaise;
        }
        discountPaise = calculated;
      } else {
        // fixed discount in paise
        discountPaise = Math.min(coupon.discountValue, subtotalPaise);
      }

      appliedCouponInfo = {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      };
    }

    const netSubtotal = Math.max(0, subtotalPaise - discountPaise);

    // Calculate Shipping
    let shippingCostPaise = 0;
    if (shippingMethod === 'EXPRESS') {
      shippingCostPaise = settings.expressShippingCostPaise;
    } else {
      // Standard Shipping: Free above threshold
      if (netSubtotal >= settings.freeShippingThresholdPaise) {
        shippingCostPaise = 0;
      } else {
        shippingCostPaise = settings.standardShippingCostPaise;
      }
    }

    // Calculate Tax (e.g. 5% GST included or added on taxable amount)
    const taxPaise = Math.round((netSubtotal * (settings.taxRatePercent || 5)) / 100);

    const totalPaise = netSubtotal + shippingCostPaise + taxPaise;

    return {
      items,
      subtotalPaise,
      discountPaise,
      appliedCoupon: appliedCouponInfo,
      shippingCostPaise,
      taxPaise,
      totalPaise,
      currency: settings.currency || 'INR',
    };
  }
}
