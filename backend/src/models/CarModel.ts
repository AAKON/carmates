import { Schema, model, type Document, type Types } from 'mongoose';

export interface CarModelDoc extends Document {
  make: Types.ObjectId;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const carModelSchema = new Schema<CarModelDoc>(
  {
    make: {
      type: Schema.Types.ObjectId,
      ref: 'Make',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 80
    }
  },
  { timestamps: true }
);

carModelSchema.index({ make: 1, name: 1 }, { unique: true });
carModelSchema.index({ make: 1, slug: 1 }, { unique: true });

export const CarModel = model<CarModelDoc>('CarModel', carModelSchema);

