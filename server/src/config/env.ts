import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'organiva_jwt_secure_secret_token_key_2026_dtc_pakistan',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@organiva.pk',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'OrganivaAdmin2026!',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  WHATSAPP_NUMBER: process.env.WHATSAPP_NUMBER || '+923001234567',
  WHATSAPP_RAW_NUMBER: (process.env.WHATSAPP_NUMBER || '923156251281').replace(/\D/g, ''),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  JAZZCASH: {
    MERCHANT_ID: process.env.JAZZCASH_MERCHANT_ID || 'MC12345',
    PASSWORD: process.env.JAZZCASH_PASSWORD || 'pass12345',
    INTEGRITY_SALT: process.env.JAZZCASH_INTEGRITY_SALT || 'salt12345',
    RETURN_URL: process.env.JAZZCASH_RETURN_URL || 'http://localhost:3000/checkout/callback/jazzcash',
  },
  EASYPAISA: {
    MERCHANT_ID: process.env.EASYPAISA_MERCHANT_ID || 'EP12345',
    PASSWORD: process.env.EASYPAISA_PASSWORD || 'eppass12345',
    HASH_KEY: process.env.EASYPAISA_HASH_KEY || 'ephash12345',
    RETURN_URL: process.env.EASYPAISA_RETURN_URL || 'http://localhost:3000/checkout/callback/easypaisa',
  },
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    API_KEY: process.env.CLOUDINARY_API_KEY || '',
    API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  },
  SAFEPAY: {
    PUBLIC_KEY: process.env.SAFE_PAY_PUBLIC_KEY || '',
    SECRET_KEY: process.env.SAFE_PAY_SECRET_KEY || '',
    ENVIRONMENT: process.env.SAFE_PAY_ENVIRONMENT || 'sandbox',
    BASE_URL: process.env.SAFE_PAY_BASE_URL || 'https://sandbox.api.getsafepay.com',
  },
};
