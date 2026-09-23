import mongoose, { Schema, Document } from 'mongoose';

export interface IBenefit {
  number: string;
  title: string;
  description: string;
  icon?: string;
}

export interface ISpecification {
  key: string;
  value: string;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  sku: string;
  category: mongoose.Types.ObjectId | string;
  shortBenefit: string;
  price: number;
  salePrice?: number;
  costPrice: number; // Admin only - supplier cost
  stock: number;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'PRE_ORDER';
  description: string;
  problemStatement: string;
  solutionStatement: string;
  benefits: IBenefit[];
  specifications: ISpecification[];
  images: string[];
  videoUrl?: string;
  threeDModel?: {
    enabled: boolean;
    modelType?: string; // 'orbitseal' | 'organizer' | 'custom'
    modelUrl?: string;
    accentColor?: string;
  };
  isHero: boolean;
  isFeatured: boolean;
  rating?: number;
  reviewCount?: number;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BenefitSchema = new Schema<IBenefit>(
  {
    number: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String },
  },
  { _id: false }
);

const SpecificationSchema = new Schema<ISpecification>(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    shortBenefit: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    costPrice: { type: Number, required: true, min: 0, default: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    stockStatus: {
      type: String,
      enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'PRE_ORDER'],
      default: 'IN_STOCK',
    },
    description: { type: String, required: true },
    problemStatement: { type: String, required: true },
    solutionStatement: { type: String, required: true },
    benefits: [BenefitSchema],
    specifications: [SpecificationSchema],
    images: [{ type: String, required: true }],
    videoUrl: { type: String },
    threeDModel: {
      enabled: { type: Boolean, default: false },
      modelType: { type: String, default: 'standard' },
      modelUrl: { type: String },
      accentColor: { type: String, default: '#5B755D' },
    },
    isHero: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: [{ type: String }],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Helpful indexes
ProductSchema.index({ isHero: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ category: 1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
