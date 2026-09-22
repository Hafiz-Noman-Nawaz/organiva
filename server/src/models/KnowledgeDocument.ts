import mongoose, { Schema, Document } from 'mongoose';

export interface IKnowledgeDocument extends Document {
  title: string;
  category: 'PRODUCT' | 'POLICY' | 'FAQ' | 'USAGE_GUIDE' | 'BRAND';
  content: string;
  tags: string[];
  productRef?: mongoose.Types.ObjectId;
  lastSyncedAt: Date;
}

const KnowledgeDocumentSchema = new Schema<IKnowledgeDocument>(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['PRODUCT', 'POLICY', 'FAQ', 'USAGE_GUIDE', 'BRAND'],
      required: true,
    },
    content: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    productRef: { type: Schema.Types.ObjectId, ref: 'Product' },
    lastSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

KnowledgeDocumentSchema.index({ category: 1 });
KnowledgeDocumentSchema.index({ tags: 1 });
KnowledgeDocumentSchema.index({ title: 'text', content: 'text' });

export const KnowledgeDocument = mongoose.model<IKnowledgeDocument>(
  'KnowledgeDocument',
  KnowledgeDocumentSchema
);
