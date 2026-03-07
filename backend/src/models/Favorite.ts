import { Schema, model, type Document, type Types } from 'mongoose';

export interface FavoriteDoc extends Document {
  userId: Types.ObjectId;
  listingId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const favoriteSchema = new Schema<FavoriteDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    listingId: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true
    }
  },
  {
    timestamps: true
  }
);

favoriteSchema.index({ userId: 1, listingId: 1 }, { unique: true });

export const Favorite = model<FavoriteDoc>('Favorite', favoriteSchema);

