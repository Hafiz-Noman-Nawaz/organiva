import mongoose, { Schema, Document } from 'mongoose';

export interface ICityOverride {
  city: string;
  rate: number;
}

export interface IShippingRule extends Document {
  name: string;
  flatRate: number;
  freeShippingThreshold: number;
  isDefault: boolean;
  cityOverrides: ICityOverride[];
  estimatedDays: string;
  isActive: boolean;
}

const CityOverrideSchema = new Schema<ICityOverride>(
  {
    city: { type: String, required: true, trim: true },
    rate: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ShippingRuleSchema = new Schema<IShippingRule>(
  {
    name: { type: String, required: true, default: 'Standard Express Nationwide' },
    flatRate: { type: Number, required: true, default: 250 },
    freeShippingThreshold: { type: Number, required: true, default: 3500 },
    isDefault: { type: Boolean, default: true },
    cityOverrides: [CityOverrideSchema],
    estimatedDays: { type: String, default: '2-4 Business Days' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ShippingRule = mongoose.model<IShippingRule>('ShippingRule', ShippingRuleSchema);
