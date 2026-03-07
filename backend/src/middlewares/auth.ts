import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { User, type UserDoc } from '../models/User';

export interface AuthUser {
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

export interface AuthRequest extends Request {
  user?: AuthUser;
}

interface JwtPayload {
  sub: string;
  role: UserDoc['role'];
  account_type: UserDoc['account_type'];
  status: UserDoc['status'];
  iat?: number;
  exp?: number;
}

export async function requireAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication required');
    }

    const token = authHeader.substring('Bearer '.length);
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    const user = await User.findById(decoded.sub);
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    req.user = {
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

    next();
  } catch (err) {
    next(err);
  }
}

export async function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring('Bearer '.length);
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      return next();
    }

    const user = await User.findById(decoded.sub);
    if (user) {
      req.user = {
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

    next();
  } catch {
    next();
  }
}

export function requireAdmin(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  if (req.user.role !== 'admin') {
    return next(ApiError.forbidden('Admin access required'));
  }

  return next();
}

export function requireActiveUser(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  if (req.user.status !== 'active') {
    return next(ApiError.forbidden('User is blocked'));
  }

  return next();
}

