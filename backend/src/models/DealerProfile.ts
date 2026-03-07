import { Schema, model, type Document, type Types } from 'mongoose';

export interface DealerProfileAttrs {
  user: Types.ObjectId;
  dealerName: string;
  address: string;
  logoUrl?: string;
  description?: string;
  city?: string;
  area?: string;
}

export interface DealerProfileDoc extends Document {
  user: Types.ObjectId;
  dealerName: string;
  address: string;
  logoUrl?: string;
  description?: string;
  city?: string;
  area?: string;
  createdAt: Date;
  updatedAt: Date;
}

const dealerProfileSchema = new Schema<DealerProfileDoc>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    dealerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255
    },
    logoUrl: {
      type: String,
      trim: true,
      maxlength: 500
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    city: {
      type: String,
      trim: true,
      maxlength: 80
    },
    area: {
      type: String,
      trim: true,
      maxlength: 80
    }
  },
  {
    timestamps: true
  }
);

dealerProfileSchema.index({ user: 1 }, { unique: true });

export const DealerProfile = model<DealerProfileDoc>(
  'DealerProfile',
  dealerProfileSchema
);

