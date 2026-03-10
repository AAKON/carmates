import { isValidObjectId } from 'mongoose';
import { User, type UserDoc } from '../models/User';
import {
  DealerProfile,
  type DealerProfileDoc
} from '../models/DealerProfile';
import { ApiError } from '../utils/ApiError';

export interface UserProfileDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  area?: string;
  profileImageUrl?: string;
  account_type: UserDoc['account_type'];
  role: UserDoc['role'];
  status: UserDoc['status'];
}

export interface DealerProfileDTO {
  id: string;
  dealerName: string;
  address: string;
  logoUrl?: string;
  description?: string;
  city?: string;
  area?: string;
}

export interface AccountProfileDTO {
  user: UserProfileDTO;
  dealerProfile?: DealerProfileDTO | null;
}

function toUserProfileDTO(user: UserDoc): UserProfileDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    city: user.city,
    area: user.area,
    profileImageUrl: user.profileImageUrl,
    account_type: user.account_type,
    role: user.role,
    status: user.status
  };
}

function toDealerProfileDTO(
  profile: DealerProfileDoc | null
): DealerProfileDTO | null {
  if (!profile) return null;
  return {
    id: profile.id,
    dealerName: profile.dealerName,
    address: profile.address,
    logoUrl: profile.logoUrl,
    description: profile.description,
    city: profile.city,
    area: profile.area
  };
}

export async function getAccountProfile(
  userId: string
): Promise<AccountProfileDTO> {
  if (!isValidObjectId(userId)) {
    throw ApiError.badRequest('Invalid user id');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const dealerProfile =
    user.account_type === 'dealer'
      ? await DealerProfile.findOne({ user: user._id })
      : null;

  return {
    user: toUserProfileDTO(user),
    dealerProfile: toDealerProfileDTO(dealerProfile)
  };
}

export async function updateUserProfile(
  userId: string,
  payload: {
    name?: string;
    phone?: string;
    city?: string;
    area?: string;
  }
): Promise<UserProfileDTO> {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (payload.name !== undefined) user.name = payload.name;
  if (payload.phone !== undefined) user.phone = payload.phone;
  if (payload.city !== undefined) user.city = payload.city;
  if (payload.area !== undefined) user.area = payload.area;

  await user.save();

  return toUserProfileDTO(user);
}

export async function upsertDealerProfile(
  userId: string,
  payload: {
    dealerName: string;
    address: string;
    logoUrl?: string;
    description?: string;
    city?: string;
    area?: string;
  }
): Promise<DealerProfileDTO> {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.account_type !== 'dealer') {
    throw ApiError.forbidden('Only dealer accounts can have a dealer profile');
  }

  const update = {
    dealerName: payload.dealerName,
    address: payload.address,
    logoUrl: payload.logoUrl,
    description: payload.description,
    city: payload.city,
    area: payload.area
  };

  const profile = await DealerProfile.findOneAndUpdate(
    { user: user._id },
    { user: user._id, ...update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return toDealerProfileDTO(profile)!;
}

export async function updateProfileImage(
  userId: string,
  imageUrl: string
): Promise<UserProfileDTO> {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.profileImageUrl = imageUrl;
  await user.save();

  return toUserProfileDTO(user);
}

export async function deleteProfileImage(
  userId: string
): Promise<UserProfileDTO> {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.profileImageUrl = undefined;
  await user.save();

  return toUserProfileDTO(user);
}

