import { isValidObjectId } from 'mongoose';
import { DealerProfile } from '../models/DealerProfile';
import { Listing } from '../models/Listing';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';

export interface PublicDealerInfo {
  id: string;
  userId: string;
  dealerName: string;
  address: string;
  logoUrl?: string;
  description?: string;
  city?: string;
  area?: string;
  liveListingsCount: number;
}

export async function getPublicDealer(
  dealerUserId: string
): Promise<PublicDealerInfo> {
  if (!isValidObjectId(dealerUserId)) {
    throw ApiError.badRequest('Invalid dealer id');
  }

  const user = await User.findById(dealerUserId);
  if (!user || user.account_type !== 'dealer') {
    throw ApiError.notFound('Dealer not found');
  }

  const profile = await DealerProfile.findOne({ user: user._id });
  if (!profile) {
    throw ApiError.notFound('Dealer profile not found');
  }

  const liveListingsCount = await Listing.countDocuments({
    userId: user._id,
    status: 'live'
  });

  return {
    id: profile.id,
    userId: user.id,
    dealerName: profile.dealerName,
    address: profile.address,
    logoUrl: profile.logoUrl,
    description: profile.description,
    city: profile.city,
    area: profile.area,
    liveListingsCount
  };
}

