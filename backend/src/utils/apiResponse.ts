import type { Response } from 'express';

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  details?: unknown;
}

export function success<T>(
  res: Response,
  data: T,
  message = 'OK',
  statusCode = 200
): Response<ApiSuccessResponse<T>> {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

export function error(
  res: Response,
  message: string,
  details?: unknown,
  statusCode = 400
): Response<ApiErrorResponse> {
  return res.status(statusCode).json({
    success: false,
    message,
    details
  });
}

