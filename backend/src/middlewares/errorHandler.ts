import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import type { ApiErrorResponse } from '../utils/apiResponse';

export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  next(ApiError.notFound(`Route not found: ${req.originalUrl}`));
}

// Central error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: Error | ApiError,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = (err instanceof ApiError ? err.statusCode : null) ?? 500;
  const isDev = process.env.NODE_ENV === 'development';
  const message =
    statusCode === 500
      ? isDev ? `Internal server error: ${err?.message || 'Unknown error'}` : 'Internal server error'
      : err?.message || 'Request failed';
  const details =
    err instanceof ApiError && statusCode !== 500 ? err.details : undefined;

  const payload: ApiErrorResponse = {
    success: false,
    message,
    details
  };

  console.error('Error handler:', {
    statusCode,
    message: err?.message,
    stack: isDev ? err?.stack : undefined
  });

  res.status(statusCode).json(payload);
}

