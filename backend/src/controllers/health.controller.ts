import type { Request, Response } from 'express';
import { success } from '../utils/apiResponse';

export function getHealth(_req: Request, res: Response): void {
  return success(res, { ok: true }, 'Healthy');
}

