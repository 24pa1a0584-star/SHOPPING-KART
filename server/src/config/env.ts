import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().default('mongodb://127.0.0.1:27017/lumora_ecommerce'),
  JWT_SECRET: z.string().default('lumora_super_secret_jwt_key_2026_production_grade'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  
  // Safe Bootstrap Admin Credentials
  INITIAL_SETUP_ENABLED: z.string().default('true'),
  BOOTSTRAP_ADMIN_NAME: z.string().default('Lumora Administrator'),
  BOOTSTRAP_ADMIN_EMAIL: z.string().default('admin@lumora.store'),
  BOOTSTRAP_ADMIN_PASSWORD: z.string().default('Admin@Lumora2026'),

  // Payment configuration (Test/Demo mode)
  PAYMENT_MODE: z.enum(['DEMO', 'RAZORPAY_TEST', 'RAZORPAY_LIVE']).default('DEMO'),
  RAZORPAY_KEY_ID: z.string().optional().default('rzp_test_placeholder_key'),
  RAZORPAY_KEY_SECRET: z.string().optional().default('placeholder_secret'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment configuration validation failed:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
