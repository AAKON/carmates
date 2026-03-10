import { isValidObjectId } from 'mongoose';
import { User, type UserDoc } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { parsePagination } from '../utils/pagination';
import { toString } from '../utils/query';

export interface AdminUserDTO {
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
  createdAt: Date;
}

function toAdminUserDTO(user: UserDoc): AdminUserDTO {
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
    status: user.status,
    createdAt: user.createdAt
  };
}

export async function listUsersForAdmin(
  query: Record<string, unknown>
): Promise<{
  items: AdminUserDTO[];
  total: number;
  page: number;
  limit: number;
}> {
  const search = toString(query.search ?? null, null);
  const status = toString(query.status ?? null, null) as
    | UserDoc['status']
    | null;
  const accountType = toString(query.account_type ?? null, null) as
    | UserDoc['account_type']
    | null;

  const { page, limit, skip } = parsePagination(query.page, query.limit, {
    defaultLimit: 20,
    maxLimit: 100
  });

  const filter: Record<string, unknown> = {};

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }

  if (status) filter.status = status;
  if (accountType) filter.account_type = accountType;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);

  return {
    items: users.map(toAdminUserDTO),
    total,
    page,
    limit
  };
}

export async function blockUser(userId: string): Promise<AdminUserDTO> {
  const user = await findUserOrThrow(userId);
  user.status = 'blocked';
  await user.save();
  return toAdminUserDTO(user);
}

export async function unblockUser(userId: string): Promise<AdminUserDTO> {
  const user = await findUserOrThrow(userId);
  user.status = 'active';
  await user.save();
  return toAdminUserDTO(user);
}

async function findUserOrThrow(userId: string): Promise<UserDoc> {
  if (!isValidObjectId(userId)) {
    throw ApiError.badRequest('Invalid user id');
  }
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
}

