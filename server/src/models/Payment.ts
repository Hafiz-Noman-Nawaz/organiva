import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  orderId: string;
  orderRef: mongoose.Types.ObjectId;
  gateway: 'COD' | 'SAFEPAY' | 'JAZZCASH' | 'EASYPAISA';
  transactionId: string;
  amount: number;
  currency: string;
  status: 'INITIATED' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  requestReference?: string;
  responseReference?: string;
  rawStatus?: any;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: String, required: true, trim: true },
    orderRef: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    gateway: {
      type: String,
      enum: ['COD', 'SAFEPAY', 'JAZZCASH', 'EASYPAISA'],
      required: true,
    },
    transactionId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'PKR' },
    status: {
      type: String,
      enum: ['INITIATED', 'SUCCESS', 'FAILED', 'CANCELLED'],
      default: 'INITIATED',
    },
    requestReference: { type: String },
    responseReference: { type: String },
    rawStatus: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

PaymentSchema.index({ orderId: 1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
