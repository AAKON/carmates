import { Schema, model, type Document, type Types } from 'mongoose';
import type { AccountType } from './User';

export type ListingStatus =
  | 'draft'
  | 'pending'
  | 'live'
  | 'paused'
  | 'sold'
  | 'rejected';

export type FuelType =
  | 'petrol'
  | 'diesel'
  | 'octane'
  | 'cng'
  | 'hybrid'
  | 'electric'
  | 'other';

export type TransmissionType = 'manual' | 'automatic' | 'cvt' | 'other';

export type CarCondition = 'used' | 'reconditioned' | 'new';

export interface ListingPhoto {
  url: string;
  key?: string;
  sortOrder: number;
}

export interface ListingDoc extends Document {
  userId: Types.ObjectId;
  account_type_snapshot: AccountType;
  makeId: Types.ObjectId;
  modelId: Types.ObjectId;
  year: number;
  price: number;
  mileage: number;
  fuel: FuelType;
  transmission: TransmissionType;
  condition: CarCondition;
  city: string;
  area: string;
  description: string;
  phoneOverride?: string;
  status: ListingStatus;
  rejectionReason?: string;
  photos: ListingPhoto[];
  coverPhotoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const photoSchema = new Schema<ListingPhoto>(
  {
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    key: {
      type: String,
      trim: true,
      maxlength: 255
    },
    sortOrder: {
      type: Number,
      required: true,
      default: 0
    }
  },
  { _id: false }
);

const listingSchema = new Schema<ListingDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    account_type_snapshot: {
      type: String,
      enum: ['individual', 'dealer'],
      required: true
    },
    makeId: {
      type: Schema.Types.ObjectId,
      ref: 'Make',
      required: true
    },
    modelId: {
      type: Schema.Types.ObjectId,
      ref: 'CarModel',
      required: true
    },
    year: {
      type: Number,
      required: true,
      min: 1950,
      max: new Date().getFullYear() + 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    mileage: {
      type: Number,
      required: true,
      min: 0
    },
    fuel: {
      type: String,
      enum: ['petrol', 'diesel', 'octane', 'cng', 'hybrid', 'electric', 'other'],
      required: true
    },
    transmission: {
      type: String,
      enum: ['manual', 'automatic', 'cvt', 'other'],
      required: true
    },
    condition: {
      type: String,
      enum: ['used', 'reconditioned', 'new'],
      required: true
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    area: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000
    },
    phoneOverride: {
      type: String,
      trim: true,
      maxlength: 40
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'live', 'paused', 'sold', 'rejected'],
      default: 'draft'
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    photos: {
      type: [photoSchema],
      default: []
    },
    coverPhotoUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    }
  },
  {
    timestamps: true
  }
);

listingSchema.index({ userId: 1, status: 1, createdAt: -1 });
listingSchema.index({ status: 1, createdAt: -1 });
listingSchema.index({ makeId: 1, modelId: 1, year: -1 });

export const Listing = model<ListingDoc>('Listing', listingSchema);

