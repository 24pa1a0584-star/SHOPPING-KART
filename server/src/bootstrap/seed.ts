import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { Category } from '../models/Category';
import { Brand } from '../models/Brand';
import { Product } from '../models/Product';
import { ProductVariant } from '../models/ProductVariant';
import { Coupon } from '../models/Coupon';
import { StoreSettings } from '../models/StoreSettings';
import { bootstrapAdmin } from './adminBootstrap';

export const seedDatabase = async (): Promise<void> => {
  await connectDB();

  console.log('🌱 Starting LUMORA catalog seeding...');

  // 1. Initialize store settings
  const existingSettings = await StoreSettings.findOne();
  if (!existingSettings) {
    await StoreSettings.create({
      storeName: 'LUMORA',
      tagline: 'Discover more. Love every find.',
      supportEmail: 'care@lumora.store',
      supportPhone: '+91 80000 12345',
      currency: 'INR',
      currencySymbol: '₹',
      taxRatePercent: 5,
      freeShippingThresholdPaise: 99900, // ₹999
      standardShippingCostPaise: 7000,  // ₹70
      expressShippingCostPaise: 15000,  // ₹150
      demoMode: true,
    });
    console.log('✅ Store settings initialized');
  }

  // 2. Safe admin bootstrap
  await bootstrapAdmin();

  // 3. Categories
  const categoriesData = [
    {
      name: 'Electronics & Audio',
      slug: 'electronics-audio',
      description: 'Cutting-edge wireless audio, smart gear, and acoustic marvels.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      icon: 'Headphones',
      displayOrder: 1,
    },
    {
      name: 'Fashion & Apparel',
      slug: 'fashion-apparel',
      description: 'Contemporary streetwear, minimal classics, and premium fabrics.',
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80',
      icon: 'Shirt',
      displayOrder: 2,
    },
    {
      name: 'Accessories & Wearables',
      slug: 'accessories-wearables',
      description: 'Handcrafted leather goods, sleek smartwatches, and everyday essentials.',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      icon: 'Watch',
      displayOrder: 3,
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Artisanal ceramics, ambient mood lights, and cozy organic textures.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
      icon: 'Home',
      displayOrder: 4,
    },
    {
      name: 'Gifts & Essentials',
      slug: 'gifts-essentials',
      description: 'Curated gift hampers, desk accessories, and aromatic scents.',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
      icon: 'Gift',
      displayOrder: 5,
    },
  ];

  const categoryMap = new Map<string, any>();
  for (const cat of categoriesData) {
    const existing = await Category.findOne({ slug: cat.slug });
    if (existing) {
      categoryMap.set(cat.slug, existing);
    } else {
      const created = await Category.create(cat);
      categoryMap.set(cat.slug, created);
    }
  }
  console.log(`✅ Loaded ${categoryMap.size} categories`);

  // 4. Brands
  const brandsData = [
    {
      name: 'Lumora Studio',
      slug: 'lumora-studio',
      description: 'Our in-house design lab crafting future-ready everyday pieces.',
    },
    {
      name: 'Aura Acoustics',
      slug: 'aura-acoustics',
      description: 'High-fidelity audio engineered for immersive clarity.',
    },
    {
      name: 'Urban Thread',
      slug: 'urban-thread',
      description: 'Modern silhouettes designed with sustainable organic cotton.',
    },
    {
      name: 'Apex Gear',
      slug: 'apex-gear',
      description: 'Performance-driven accessories built to endure daily transit.',
    },
    {
      name: 'Terra Living',
      slug: 'terra-living',
      description: 'Nordic minimalist home decor and calming ambient pieces.',
    },
  ];

  const brandMap = new Map<string, any>();
  for (const brand of brandsData) {
    const existing = await Brand.findOne({ slug: brand.slug });
    if (existing) {
      brandMap.set(brand.slug, existing);
    } else {
      const created = await Brand.create(brand);
      brandMap.set(brand.slug, created);
    }
  }
  console.log(`✅ Loaded ${brandMap.size} brands`);

  // 5. Products & Variants (Check if products already exist)
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    const productsData = [
      {
        name: 'Aura SoundFlow Wireless ANC Headphones',
        slug: 'aura-soundflow-wireless-anc-headphones',
        description:
          'Experience concert-hall acoustics with active noise cancellation, custom 40mm titanium drivers, and 45-hour playback. Engineered with soft memory foam ear cushions for all-day comfort.',
        categorySlug: 'electronics-audio',
        brandSlug: 'aura-acoustics',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
        ],
        attributes: [
          { name: 'Driver Size', value: '40mm Titanium' },
          { name: 'Battery Life', value: '45 Hours' },
          { name: 'Connectivity', value: 'Bluetooth 5.3 & 3.5mm Aux' },
          { name: 'Warranty', value: '1 Year Brand Warranty' },
        ],
        tags: ['headphones', 'wireless', 'audio', 'anc', 'lumora-pick'],
        isFeatured: true,
        basePricePaise: 499900, // ₹4,999
        ratingAverage: 4.8,
        ratingCount: 124,
        variants: [
          {
            sku: 'AURA-SF-BLK',
            title: 'Midnight Black',
            options: [{ name: 'Color', value: 'Midnight Black' }],
            pricePaise: 499900,
            compareAtPricePaise: 799900,
            stock: 25,
            images: [
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            sku: 'AURA-SF-SLV',
            title: 'Lunar Silver',
            options: [{ name: 'Color', value: 'Lunar Silver' }],
            pricePaise: 529900,
            compareAtPricePaise: 849900,
            stock: 18,
            images: [
              'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            sku: 'AURA-SF-VIO',
            title: 'Electric Violet Edition',
            options: [{ name: 'Color', value: 'Electric Violet' }],
            pricePaise: 549900,
            compareAtPricePaise: 899900,
            stock: 12,
            images: [
              'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
            ],
          },
        ],
      },
      {
        name: 'Apex Horizon AMOLED Smartwatch',
        slug: 'apex-horizon-amoled-smartwatch',
        description:
          'A sleek 1.43-inch ultra-bright AMOLED display encased in aerospace-grade aluminium. Features continuous heart rate monitoring, SpO2, sleep tracking, Bluetooth calling, and 10-day battery life.',
        categorySlug: 'accessories-wearables',
        brandSlug: 'apex-gear',
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
        ],
        attributes: [
          { name: 'Display', value: '1.43" AMOLED 466x466' },
          { name: 'Water Resistance', value: 'IP68 / 5ATM' },
          { name: 'Battery', value: 'Up to 10 Days' },
          { name: 'Sensors', value: 'Optical Heart Rate, SpO2, Accelerometer' },
        ],
        tags: ['smartwatch', 'fitness', 'wearable', 'waterproof'],
        isFeatured: true,
        basePricePaise: 349900, // ₹3,499
        ratingAverage: 4.7,
        ratingCount: 89,
        variants: [
          {
            sku: 'APEX-HOR-BLK',
            title: 'Space Graphite / Black Strap',
            options: [{ name: 'Color', value: 'Space Graphite' }],
            pricePaise: 349900,
            compareAtPricePaise: 599900,
            stock: 30,
            images: [
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            sku: 'APEX-HOR-ORG',
            title: 'Titanium Silver / Sunset Coral Strap',
            options: [{ name: 'Color', value: 'Sunset Coral' }],
            pricePaise: 369900,
            compareAtPricePaise: 649900,
            stock: 14,
            images: [
              'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
            ],
          },
        ],
      },
      {
        name: 'Urban Heavyweight Boxy Fit Tee',
        slug: 'urban-heavyweight-boxy-fit-tee',
        description:
          'Crafted from 280 GSM combed organic cotton for the ultimate structure, drape, and breathable softness. Pre-shrunk with reinforced collar stitching for enduring wear.',
        categorySlug: 'fashion-apparel',
        brandSlug: 'urban-thread',
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
        ],
        attributes: [
          { name: 'Fabric', value: '100% Organic Combed Cotton (280 GSM)' },
          { name: 'Fit', value: 'Relaxed Boxy Fit' },
          { name: 'Wash Care', value: 'Machine wash cold inside out' },
        ],
        tags: ['tshirt', 'streetwear', 'cotton', 'unisex', 'trending'],
        isFeatured: true,
        basePricePaise: 129900, // ₹1,299
        ratingAverage: 4.9,
        ratingCount: 210,
        variants: [
          {
            sku: 'URB-TEE-BLK-M',
            title: 'Washed Black / M',
            options: [
              { name: 'Color', value: 'Washed Black' },
              { name: 'Size', value: 'M' },
            ],
            pricePaise: 129900,
            compareAtPricePaise: 199900,
            stock: 40,
            images: [
              'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            sku: 'URB-TEE-BLK-L',
            title: 'Washed Black / L',
            options: [
              { name: 'Color', value: 'Washed Black' },
              { name: 'Size', value: 'L' },
            ],
            pricePaise: 129900,
            compareAtPricePaise: 199900,
            stock: 35,
            images: [
              'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            sku: 'URB-TEE-CRM-M',
            title: 'Warm Cream / M',
            options: [
              { name: 'Color', value: 'Warm Cream' },
              { name: 'Size', value: 'M' },
            ],
            pricePaise: 129900,
            compareAtPricePaise: 199900,
            stock: 28,
            images: [
              'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            sku: 'URB-TEE-LAV-L',
            title: 'Soft Lavender / L',
            options: [
              { name: 'Color', value: 'Soft Lavender' },
              { name: 'Size', value: 'L' },
            ],
            pricePaise: 139900,
            compareAtPricePaise: 219900,
            stock: 15,
            images: [
              'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
            ],
          },
        ],
      },
      {
        name: 'Terra Aura Ceramic Ultrasonic Diffuser',
        slug: 'terra-aura-ceramic-ultrasonic-diffuser',
        description:
          'Hand-finished matte ceramic aroma diffuser with gentle ambient warm glow. Quiet ultrasonic misting disperses essential oils across up to 500 sq ft.',
        categorySlug: 'home-living',
        brandSlug: 'terra-living',
        images: [
          'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
        ],
        attributes: [
          { name: 'Capacity', value: '250ml (up to 8 hours misting)' },
          { name: 'Material', value: 'Handmade Matte Ceramic Cover' },
          { name: 'Modes', value: 'Continuous & Intermittent Misting' },
          { name: 'Lighting', value: 'Ambient Warm Light (Dimmable)' },
        ],
        tags: ['home', 'decor', 'aroma', 'diffuser', 'wellness'],
        isFeatured: true,
        basePricePaise: 229900, // ₹2,299
        ratingAverage: 4.9,
        ratingCount: 78,
        variants: [
          {
            sku: 'TERRA-DIF-CRM',
            title: 'Sand Cream',
            options: [{ name: 'Color', value: 'Sand Cream' }],
            pricePaise: 229900,
            compareAtPricePaise: 349900,
            stock: 20,
            images: [
              'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            sku: 'TERRA-DIF-TER',
            title: 'Sunset Terracotta',
            options: [{ name: 'Color', value: 'Terracotta' }],
            pricePaise: 249900,
            compareAtPricePaise: 369900,
            stock: 15,
            images: [
              'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
            ],
          },
        ],
      },
      {
        name: 'Lumora Artisan Full-Grain Leather Cardholder',
        slug: 'lumora-artisan-full-grain-leather-cardholder',
        description:
          'Minimalist RFID-blocking cardholder made from vegetable-tanned Italian leather. Slim profile holds 6 cards plus folded banknotes with hand-burnished edges.',
        categorySlug: 'accessories-wearables',
        brandSlug: 'lumora-studio',
        images: [
          'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
        ],
        attributes: [
          { name: 'Material', value: 'Vegetable-Tanned Full Grain Leather' },
          { name: 'Capacity', value: '6 Cards + Cash Slot' },
          { name: 'Protection', value: 'Built-in RFID Shielding' },
        ],
        tags: ['leather', 'wallet', 'minimal', 'gift'],
        isFeatured: false,
        basePricePaise: 89900, // ₹899
        ratingAverage: 4.6,
        ratingCount: 52,
        variants: [
          {
            sku: 'LUM-CRD-TAN',
            title: 'Cognac Tan',
            options: [{ name: 'Color', value: 'Cognac Tan' }],
            pricePaise: 89900,
            compareAtPricePaise: 149900,
            stock: 30,
            images: [
              'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
            ],
          },
          {
            sku: 'LUM-CRD-BLK',
            title: 'Obsidian Black',
            options: [{ name: 'Color', value: 'Obsidian Black' }],
            pricePaise: 89900,
            compareAtPricePaise: 149900,
            stock: 25,
            images: [
              'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
            ],
          },
        ],
      },
      {
        name: 'LUMORA Botanical Soy Candle Gift Set',
        slug: 'lumora-botanical-soy-candle-gift-set',
        description:
          'Trio of artisanal 100% natural soy wax candles hand-poured with crackling wooden wicks. Scents: Amber & Vanilla, Wild Fig & Cedar, and Japanese Yuzu.',
        categorySlug: 'gifts-essentials',
        brandSlug: 'lumora-studio',
        images: [
          'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop&q=80',
        ],
        attributes: [
          { name: 'Wax Type', value: '100% Non-Toxic Soy Wax' },
          { name: 'Burn Time', value: '35 Hours per Candle (105 Hours total)' },
          { name: 'Set Includes', value: '3 x 180g Glass Tumbler Candles + Wooden Matches' },
        ],
        tags: ['gifts', 'candle', 'fragrance', 'luxury', 'lifestyle'],
        isFeatured: false,
        basePricePaise: 159900, // ₹1,599
        ratingAverage: 4.9,
        ratingCount: 64,
        variants: [
          {
            sku: 'LUM-CNDL-TRIO',
            title: 'Signature Trio Gift Box',
            options: [{ name: 'Set', value: 'Trio' }],
            pricePaise: 159900,
            compareAtPricePaise: 249900,
            stock: 22,
            images: [
              'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop&q=80',
            ],
          },
        ],
      },
    ];

    for (const p of productsData) {
      const category = categoryMap.get(p.categorySlug);
      const brand = brandMap.get(p.brandSlug);

      const product = await Product.create({
        name: p.name,
        slug: p.slug,
        description: p.description,
        categoryId: category._id,
        brandId: brand._id,
        images: p.images,
        attributes: p.attributes,
        tags: p.tags,
        isPublished: true,
        isFeatured: p.isFeatured,
        basePricePaise: p.basePricePaise,
        ratingAverage: p.ratingAverage,
        ratingCount: p.ratingCount,
      });

      for (const v of p.variants) {
        await ProductVariant.create({
          productId: product._id,
          sku: v.sku,
          title: v.title,
          options: v.options,
          pricePaise: v.pricePaise,
          compareAtPricePaise: v.compareAtPricePaise,
          stock: v.stock,
          images: v.images,
          isActive: true,
        });
      }
    }
    console.log(`✅ Seeded ${productsData.length} products with complete variants and stock`);
  }

  // 6. Coupons
  const couponsData = [
    {
      code: 'WELCOME10',
      discountType: 'percentage' as const,
      discountValue: 10,
      minOrderValuePaise: 49900, // ₹499
      maxDiscountPaise: 50000,   // ₹500
      usageLimit: 5000,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: 'LUMORA20',
      discountType: 'percentage' as const,
      discountValue: 20,
      minOrderValuePaise: 199900, // ₹1,999
      maxDiscountPaise: 100000,  // ₹1,000 cap
      usageLimit: 2000,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      code: 'FESTIVE500',
      discountType: 'fixed' as const,
      discountValue: 50000,      // Flat ₹500 off
      minOrderValuePaise: 249900, // ₹2,499
      usageLimit: 1000,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ];

  for (const c of couponsData) {
    const existing = await Coupon.findOne({ code: c.code });
    if (!existing) {
      await Coupon.create(c);
    }
  }
  console.log('✅ Coupons seeded successfully');

  console.log('🎉 LUMORA database seeding completed successfully!');
};

if (require.main === module) {
  seedDatabase()
    .then(() => disconnectDB())
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}
