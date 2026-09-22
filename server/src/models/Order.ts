import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  total: number;
}

export interface IStatusTimeline {
  status: string;
  timestamp: Date;
  comment: string;
}

export interface IOrder extends Document {
  orderId: string;
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    area?: string;
    postalCode?: string;
  };
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  paymentMethod: 'COD' | 'SAFEPAY' | 'JAZZCASH' | 'EASYPAISA';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  orderStatus:
    | 'PLACED'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'PACKED'
    | 'SHIPPED'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'RETURNED';
  gateway?: string;
  paymentReference?: string;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDeliveryDate?: string;
  notes?: string;
  internalNotes?: string;
  statusTimeline: IStatusTimeline[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const StatusTimelineSchema = new Schema<IStatusTimeline>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    comment: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    customer: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, lowercase: true, trim: true },
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      area: { type: String, trim: true },
      postalCode: { type: String, trim: true },
    },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, default: 0, min: 0 },
    discount: { type: Number, required: true, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'PKR' },
    paymentMethod: {
      type: String,
      enum: ['COD', 'SAFEPAY', 'JAZZCASH', 'EASYPAISA'],
      required: true,
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    orderStatus: {
      type: String,
      enum: [
        'PLACED',
        'CONFIRMED',
        'PROCESSING',
        'PACKED',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'RETURNED',
      ],
      default: 'PLACED',
    },
    gateway: { type: String },
    paymentReference: { type: String },
    courierName: { type: String, trim: true },
    trackingNumber: { type: String, trim: true },
    trackingUrl: { type: String, trim: true },
    estimatedDeliveryDate: { type: String, trim: true },
    notes: { type: String },
    internalNotes: { type: String },
    statusTimeline: [StatusTimelineSchema],
  },
  { timestamps: true }
);

OrderSchema.index({ 'customer.phone': 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
