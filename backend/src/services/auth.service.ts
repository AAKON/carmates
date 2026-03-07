import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, type UserDoc, type AccountType } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  account_type: AccountType;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUserDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  area?: string;
  account_type: UserDoc['account_type'];
  role: UserDoc['role'];
  status: UserDoc['status'];
}

function toAuthUserDTO(user: UserDoc): AuthUserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    city: user.city,
    area: user.area,
    account_type: user.account_type,
    role: user.role,
    status: user.status
  };
}

function signToken(user: UserDoc): string {
  const payload = {
    sub: user.id,
    role: user.role,
    account_type: user.account_type,
    status: user.status
  };

  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}

export async function registerUser(input: RegisterInput): Promise<{
  user: AuthUserDTO;
  token: string;
}> {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw ApiError.badRequest('Email is already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash,
    account_type: input.account_type,
    role: 'user',
    status: 'active'
  });

  const token = signToken(user);

  return { user: toAuthUserDTO(user), token };
}

export async function loginUser(input: LoginInput): Promise<{
  user: AuthUserDTO;
  token: string;
}> {
  const user = await User.findOne({ email: input.email.toLowerCase() });
  if (!user) {
    throw ApiError.badRequest('Invalid credentials');
  }

  const match = await bcrypt.compare(input.password, user.passwordHash);
  if (!match) {
    throw ApiError.badRequest('Invalid credentials');
  }

  const token = signToken(user);

  return { user: toAuthUserDTO(user), token };
}

export async function getMe(userId: string): Promise<AuthUserDTO> {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return toAuthUserDTO(user);
}

