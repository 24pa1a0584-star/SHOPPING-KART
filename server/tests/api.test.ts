import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/config/db';
import { User } from '../src/models/User';
import { Product } from '../src/models/Product';
import { ProductVariant } from '../src/models/ProductVariant';
import { Order } from '../src/models/Order';
import { Coupon } from '../src/models/Coupon';
import { Cart } from '../src/models/Cart';
import { seedDatabase } from '../src/bootstrap/seed';

describe('LUMORA Comprehensive E-Commerce Test Suite', () => {
  let customerCookie: string;
  let adminCookie: string;
  let customerId: string;
  let sampleProductSlug: string;
  let sampleVariantId: string;
  let scarceVariantId: string;

  beforeAll(async () => {
    // Connect to test database and ensure seed data is available
    await connectDB('mongodb://127.0.0.1:27017/lumora_test_db');
    await seedDatabase();

    // Create a special test variant with only 1 unit in stock for atomic overselling test
    const product = await Product.findOne({ slug: 'aura-soundflow-wireless-anc-headphones' });
    if (product) {
      sampleProductSlug = product.slug;
      const scarceVariant = await ProductVariant.create({
        productId: product._id,
        sku: 'TEST-SCARCE-001',
        title: 'Limited Edition 1-Unit Only',
        options: [{ name: 'Edition', value: 'Special' }],
        pricePaise: 299900,
        stock: 1, // Only 1 unit!
        isActive: true,
      });
      scarceVariantId = scarceVariant._id.toString();

      const existingVariant = await ProductVariant.findOne({ productId: product._id, sku: { $ne: 'TEST-SCARCE-001' } });
      if (existingVariant) {
        sampleVariantId = existingVariant._id.toString();
      }
    }
  });

  afterAll(async () => {
    // Clean up test data created during tests
    await User.deleteMany({ email: { $in: ['testcustomer@lumora.store', 'victim@lumora.store'] } });
    await Order.deleteMany({ customerEmail: { $in: ['testcustomer@lumora.store', 'victim@lumora.store', 'guest@example.com'] } });
    await ProductVariant.deleteOne({ sku: 'TEST-SCARCE-001' });
    await disconnectDB();
  });

  // 1. Health & Infrastructure
  describe('1. Health Check & API Infrastructure', () => {
    it('GET /api/health should return ok with database healthy', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.database).toBe('healthy');
    });
  });

  // 2. Authentication & Roles
  describe('2. Authentication, Password Hashing, & Roles', () => {
    it('Should register a new customer with hashed password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Priya Sharma',
          email: 'testcustomer@lumora.store',
          password: 'Password@123',
          phone: '+91 98765 00001',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('customer');
      expect(res.body.user.passwordHash).toBeUndefined(); // Never leak hash
      customerId = res.body.user.id;

      // Verify in DB that password is encrypted
      const userInDb = await User.findById(customerId);
      expect(userInDb?.passwordHash).not.toBe('Password@123');
      expect(userInDb?.passwordHash.startsWith('$2')).toBe(true);
    });

    it('Should reject duplicate registration with same email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Priya',
          email: 'testcustomer@lumora.store',
          password: 'Password@123',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('Should reject login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testcustomer@lumora.store',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
    });

    it('Should login customer successfully and return HttpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testcustomer@lumora.store',
          password: 'Password@123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      customerCookie = cookies[0];
    });

    it('Should restore session via GET /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', customerCookie);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('testcustomer@lumora.store');
    });

    it('Should logout successfully and allow login again', async () => {
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', customerCookie);
      expect(logoutRes.status).toBe(200);

      // Re-login
      const reLoginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testcustomer@lumora.store',
          password: 'Password@123',
        });
      expect(reLoginRes.status).toBe(200);
      customerCookie = reLoginRes.headers['set-cookie'][0];
    });

    it('Should authenticate administrator safely', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@lumora.store',
          password: 'Admin@Lumora2026',
        });

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('admin');
      adminCookie = res.headers['set-cookie'][0];
    });

    it('Should forbid customer from accessing admin routes', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Cookie', customerCookie);

      expect(res.status).toBe(403);
    });

    it('Should allow admin to access admin analytics', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.analytics).toBeDefined();
      expect(res.body.analytics.totalProducts).toBeGreaterThan(0);
    });
  });

  // 3. Catalog & Search
  describe('3. Catalog, Search, Filtering, and Variants', () => {
    it('GET /api/products should return list of products with variants', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.products.length).toBeGreaterThan(0);
      expect(res.body.pagination).toBeDefined();
    });

    it('GET /api/products?search=wireless should return matching products', async () => {
      const res = await request(app).get('/api/products?search=wireless');
      expect(res.status).toBe(200);
      expect(res.body.products.length).toBeGreaterThan(0);
      expect(res.body.products[0].name.toLowerCase()).toContain('wireless');
    });

    it('GET /api/products/:slug should resolve product and all active variants', async () => {
      const res = await request(app).get(`/api/products/${sampleProductSlug}`);
      expect(res.status).toBe(200);
      expect(res.body.product.slug).toBe(sampleProductSlug);
      expect(res.body.product.variants.length).toBeGreaterThan(0);
    });

    it('GET /api/products/categories should return active categories with product counts', async () => {
      const res = await request(app).get('/api/products/categories');
      expect(res.status).toBe(200);
      expect(res.body.categories.length).toBeGreaterThan(0);
    });
  });

  // 4. Cart Engine & Guest Merging
  describe('4. Shopping Cart & Guest Cart Merging', () => {
    const guestSessionId = 'guest_test_session_999';

    it('Guest should be able to add item to cart', async () => {
      const res = await request(app)
        .post('/api/cart/items')
        .set('x-guest-session-id', guestSessionId)
        .send({
          productId: (await Product.findOne({ slug: sampleProductSlug }))!._id.toString(),
          variantId: sampleVariantId,
          quantity: 2,
        });

      expect(res.status).toBe(200);
      expect(res.body.cart.items.length).toBe(1);
      expect(res.body.cart.items[0].quantity).toBe(2);
    });

    it('Guest cart should persist on retrieval', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('x-guest-session-id', guestSessionId);

      expect(res.status).toBe(200);
      expect(res.body.cart.items.length).toBe(1);
      expect(res.body.cart.subtotalPaise).toBeGreaterThan(0);
    });

    it('Guest cart should merge into customer cart upon login', async () => {
      const res = await request(app)
        .post('/api/cart/merge')
        .set('Cookie', customerCookie)
        .send({ guestSessionId });

      expect(res.status).toBe(200);
      expect(res.body.cart.items.length).toBeGreaterThan(0);

      // Verify guest cart was cleared in DB
      const guestCart = await Cart.findOne({ guestSessionId });
      expect(guestCart).toBeNull();
    });

    it('Customer should be able to update item quantity', async () => {
      const res = await request(app)
        .put(`/api/cart/items/${sampleVariantId}`)
        .set('Cookie', customerCookie)
        .send({ quantity: 3 });

      expect(res.status).toBe(200);
      expect(res.body.cart.items[0].quantity).toBe(3);
    });

    it('Customer should be able to remove item from cart', async () => {
      const res = await request(app)
        .delete(`/api/cart/items/${sampleVariantId}`)
        .set('Cookie', customerCookie);

      expect(res.status).toBe(200);
      expect(res.body.cart.items.length).toBe(0);
    });
  });

  // 5. Authoritative Pricing & Coupons
  describe('5. Authoritative Server Pricing & Coupon Validation', () => {
    it('Should calculate server quote with coupon discount', async () => {
      // Add item to customer cart first
      const product = await Product.findOne({ slug: sampleProductSlug });
      await request(app)
        .post('/api/cart/items')
        .set('Cookie', customerCookie)
        .send({
          productId: product!._id.toString(),
          variantId: sampleVariantId,
          quantity: 1,
        });

      const res = await request(app)
        .post('/api/checkout/quote')
        .set('Cookie', customerCookie)
        .send({
          couponCode: 'WELCOME10',
          shippingMethod: 'STANDARD',
        });

      expect(res.status).toBe(200);
      expect(res.body.quote.discountPaise).toBeGreaterThan(0);
      expect(res.body.quote.appliedCoupon.code).toBe('WELCOME10');
      expect(res.body.quote.totalPaise).toBe(
        res.body.quote.subtotalPaise - res.body.quote.discountPaise + res.body.quote.shippingCostPaise + res.body.quote.taxPaise
      );
    });

    it('Should reject invalid or expired coupon', async () => {
      const res = await request(app)
        .post('/api/checkout/quote')
        .set('Cookie', customerCookie)
        .send({
          couponCode: 'INVALID_COUPON_CODE',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // 6. Concurrency & Overselling Prevention
  describe('6. Atomic Inventory Concurrency & Overselling Prevention', () => {
    it('When two concurrent buyers attempt to buy the last single unit, exactly one succeeds and the other is safely rejected', async () => {
      const product = await Product.findOne({ slug: sampleProductSlug });

      // Create two independent carts, each requesting the single scarce unit
      const session1 = 'buyer_session_1';
      const session2 = 'buyer_session_2';

      await request(app)
        .post('/api/cart/items')
        .set('x-guest-session-id', session1)
        .send({
          productId: product!._id.toString(),
          variantId: scarceVariantId,
          quantity: 1,
        });

      await request(app)
        .post('/api/cart/items')
        .set('x-guest-session-id', session2)
        .send({
          productId: product!._id.toString(),
          variantId: scarceVariantId,
          quantity: 1,
        });

      const checkoutPayload1 = {
        shippingAddress: {
          name: 'Buyer One',
          phone: '+91 99999 11111',
          street: '123 MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
        },
        paymentMethod: 'DEMO',
        guestEmail: 'buyer1@example.com',
      };

      const checkoutPayload2 = {
        shippingAddress: {
          name: 'Buyer Two',
          phone: '+91 99999 22222',
          street: '456 Brigade Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560025',
        },
        paymentMethod: 'DEMO',
        guestEmail: 'buyer2@example.com',
      };

      // Launch both checkouts simultaneously
      const [res1, res2] = await Promise.all([
        request(app).post('/api/checkout/order').set('x-guest-session-id', session1).send(checkoutPayload1),
        request(app).post('/api/checkout/order').set('x-guest-session-id', session2).send(checkoutPayload2),
      ]);

      const successCount = (res1.status === 201 ? 1 : 0) + (res2.status === 201 ? 1 : 0);
      const rejectedCount = (res1.status === 409 ? 1 : 0) + (res2.status === 409 ? 1 : 0);

      // Invariant: Exactly 1 order must succeed; exactly 1 order must be rejected with 409 Conflict
      expect(successCount).toBe(1);
      expect(rejectedCount).toBe(1);

      // Invariant: Final stock must be exactly 0, NEVER negative!
      const updatedVariant = await ProductVariant.findById(scarceVariantId);
      expect(updatedVariant?.stock).toBe(0);
    });
  });

  // 7. Order Lifecycle, Snapshot, and Cancellation Restocking
  describe('7. Order Lifecycle, Snapshotting, and Cancellation Restock', () => {
    let placedOrderId: string;
    let placedOrderRef: string;
    let initialStock: number;

    it('Should place an order and generate immutable item snapshot', async () => {
      // Capture variant stock before purchase
      const variantBefore = await ProductVariant.findById(sampleVariantId);
      initialStock = variantBefore!.stock;

      const res = await request(app)
        .post('/api/checkout/order')
        .set('Cookie', customerCookie)
        .send({
          shippingAddress: {
            name: 'Priya Sharma',
            phone: '+91 98765 00001',
            street: 'Flat 402, Lotus Towers',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560038',
          },
          paymentMethod: 'DEMO',
          couponCode: 'WELCOME10',
        });

      expect(res.status).toBe(201);
      expect(res.body.order.orderReference).toMatch(/^LUM-ORD-/);
      placedOrderId = res.body.order.id;
      placedOrderRef = res.body.order.orderReference;

      // Verify stock was decremented
      const variantAfter = await ProductVariant.findById(sampleVariantId);
      expect(variantAfter!.stock).toBe(initialStock - 1);
    });

    it('Customer should be able to view their own placed order', async () => {
      const res = await request(app)
        .get(`/api/orders/${placedOrderRef}`)
        .set('Cookie', customerCookie);

      expect(res.status).toBe(200);
      expect(res.body.order.orderReference).toBe(placedOrderRef);
      expect(res.body.order.items[0].unitPricePaise).toBeGreaterThan(0);
    });

    it('Another customer cannot view this order', async () => {
      // Create second customer
      const regRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Victim User',
          email: 'victim@lumora.store',
          password: 'Password@123',
        });
      const victimCookie = regRes.headers['set-cookie'][0];

      const res = await request(app)
        .get(`/api/orders/${placedOrderRef}`)
        .set('Cookie', victimCookie);

      expect(res.status).toBe(403);
    });

    it('Order cancellation should atomically restore inventory', async () => {
      const res = await request(app)
        .post(`/api/orders/${placedOrderId}/cancel`)
        .set('Cookie', customerCookie)
        .send({ reason: 'Found alternative model' });

      expect(res.status).toBe(200);
      expect(res.body.order.fulfillment.status).toBe('CANCELLED');

      // Verify stock was restored to initial stock
      const variantRestored = await ProductVariant.findById(sampleVariantId);
      expect(variantRestored!.stock).toBe(initialStock);
    });
  });
});
