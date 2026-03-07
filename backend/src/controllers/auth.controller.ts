import type { Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from '../utils/apiResponse';
import { validateRequest } from '../utils/validation';
import { loginUser, registerUser, getMe } from '../services/auth.service';

const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(160),
  password: z.string().min(6).max(128),
  account_type: z.enum(['individual', 'dealer'])
});

const loginSchema = z.object({
  email: z.string().email().max(160),
  password: z.string().min(6).max(128)
});

export const validateRegister = validateRequest({ body: registerSchema });
export const validateLogin = validateRequest({ body: loginSchema });

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { user, token } = await registerUser(req.body);
  return success(res, { user, token }, 'Registered successfully', 201);
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { user, token } = await loginUser(req.body);
  return success(res, { user, token }, 'Logged in successfully');
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const authUser = req.user;
  if (!authUser) {
    // Should be guaranteed by middleware
    throw new Error('Missing authenticated user');
  }

  const user = await getMe(authUser.id);
  return success(res, user, 'Current user');
});

export const logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
  // Stateless JWT logout – client should discard token.
  return success(res, { ok: true }, 'Logged out');
});

