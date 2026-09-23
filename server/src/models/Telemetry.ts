import mongoose, { Document, Schema } from 'mongoose';

export type TelemetryEventType = 'impression' | 'click';

export interface ITelemetry extends Document {
  eventType: TelemetryEventType;
  path: string;
  visitorId: string;
  metadata?: {
    productId?: string;
    slug?: string;
    referrer?: string;
    userAgent?: string;
  };
  createdAt: Date;
}

const TelemetrySchema = new Schema<ITelemetry>(
  {
    eventType: {
      type: String,
      enum: ['impression', 'click'],
      required: true,
      index: true,
    },
    path: {
      type: String,
      required: true,
      trim: true,
    },
    visitorId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    metadata: {
      productId: { type: String, trim: true },
      slug: { type: String, trim: true },
      referrer: { type: String, trim: true },
      userAgent: { type: String, trim: true },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// High-performance compound index for analytics time-range aggregation
TelemetrySchema.index({ eventType: 1, createdAt: 1 });
TelemetrySchema.index({ createdAt: 1 });

export const Telemetry = mongoose.models.Telemetry || mongoose.model<ITelemetry>('Telemetry', TelemetrySchema);
