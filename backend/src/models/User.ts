import { Schema, model, type Document } from 'mongoose';

export type AccountType = 'individual' | 'dealer';
export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'blocked';

export interface UserAttrs {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  city?: string;
  area?: string;
  profileImageUrl?: string;
  account_type: AccountType;
  role?: UserRole;
  status?: UserStatus;
}

export interface UserDoc extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  city?: string;
  area?: string;
  profileImageUrl?: string;
  account_type: AccountType;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 160
    },
    passwordHash: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 40
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
    },
    profileImageUrl: {
      type: String,
      trim: true,
      maxlength: 500
    },
    account_type: {
      type: String,
      enum: ['individual', 'dealer'],
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ email: 1 }, { unique: true });

export const User = model<UserDoc>('User', userSchema);

