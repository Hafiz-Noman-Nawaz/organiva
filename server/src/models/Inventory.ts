import mongoose, { Schema, Document } from 'mongoose';

// --- SUPPLIER (ADMIN ONLY) ---
export interface ISupplier extends Document {
  name: string;
  platform: string; // e.g., '1688', 'Alibaba', 'Local Manufacturer', 'Yiwu Agent'
  contactPerson?: string;
  phone?: string;
  email?: string;
  supplierUrl?: string;
  paymentTerms?: string;
  notes?: string;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true, trim: true },
    platform: { type: String, required: true, default: 'Direct Manufacturer' },
    contactPerson: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    supplierUrl: { type: String, trim: true },
    paymentTerms: { type: String, default: 'Net 30' },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Supplier = mongoose.model<ISupplier>('Supplier', SupplierSchema);

// --- INVENTORY (ADMIN ONLY) ---
export interface IInventory extends Document {
  product: mongoose.Types.ObjectId;
  sku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  costPrice: number;
  sellingPrice: number;
  supplier?: mongoose.Types.ObjectId;
  supplierSku?: string;
  location?: string;
  reorderStatus: 'NORMAL' | 'REORDER_NEEDED' | 'ON_ORDER';
}

const InventorySchema = new Schema<IInventory>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
    sku: { type: String, required: true, unique: true, uppercase: true },
    stockQuantity: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    costPrice: { type: Number, required: true, default: 0 },
    sellingPrice: { type: Number, required: true },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    supplierSku: { type: String },
    location: { type: String, default: 'Main Warehouse - Lahore' },
    reorderStatus: {
      type: String,
      enum: ['NORMAL', 'REORDER_NEEDED', 'ON_ORDER'],
      default: 'NORMAL',
    },
  },
  { timestamps: true }
);

export const Inventory = mongoose.model<IInventory>('Inventory', InventorySchema);

// --- COUPON ---
export interface ICoupon extends Document {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountAmount: number;
  minPurchaseAmount: number;
  maxDiscount?: number;
  usageLimit?: number;
  timesUsed: number;
  isActive: boolean;
  expiresAt?: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], default: 'PERCENTAGE' },
    discountAmount: { type: Number, required: true },
    minPurchaseAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    usageLimit: { type: Number, default: 1000 },
    timesUsed: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);

// --- SITE SETTINGS ---
export interface ISiteSettings extends Document {
  storeName: string;
  tagline: string;
  announcementBarText: string;
  heroProductId?: mongoose.Types.ObjectId;
  whatsappNumber: string;
  supportEmail: string;
  currency: string;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    storeName: { type: String, default: 'ORGANIVA' },
    tagline: { type: String, default: 'Smart products. Simpler living.' },
    announcementBarText: {
      type: String,
      default: '✨ Free Nationwide Express Delivery on all orders over Rs. 3,500 | Cash on Delivery Available',
    },
    heroProductId: { type: Schema.Types.ObjectId, ref: 'Product' },
    whatsappNumber: { type: String, default: '+923001234567' },
    supportEmail: { type: String, default: 'support@organiva.pk' },
    currency: { type: String, default: 'PKR' },
  },
  { timestamps: true }
);

export const SiteSettings = mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
