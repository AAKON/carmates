import { Schema, model, type Document } from 'mongoose';

export interface MakeDoc extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const makeSchema = new Schema<MakeDoc>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 80
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 80
    }
  },
  {
    timestamps: true
  }
);

makeSchema.index({ name: 1 }, { unique: true });
makeSchema.index({ slug: 1 }, { unique: true });

export const Make = model<MakeDoc>('Make', makeSchema);

