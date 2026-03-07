import type { RequestHandler } from 'express';
import type { ZodSchema, ZodTypeAny } from 'zod';
import { ApiError } from './ApiError';

export interface ValidationSchemas {
  body?: ZodSchema<ZodTypeAny> | ZodTypeAny;
  query?: ZodSchema<ZodTypeAny> | ZodTypeAny;
  params?: ZodSchema<ZodTypeAny> | ZodTypeAny;
}

function parsePart<TSchema extends ZodTypeAny>(
  schema: TSchema | undefined,
  value: unknown
): unknown {
  if (!schema) return value;
  const result = schema.safeParse(value);
  if (!result.success) {
    throw ApiError.badRequest('Validation error', result.error.flatten());
  }
  return result.data;
}

export function validateRequest(schemas: ValidationSchemas): RequestHandler {
  return (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = parsePart(schemas.body, req.body);
      }
      if (schemas.query) {
        // Validate query but don't reassign (query is read-only in Express)
        parsePart(schemas.query, req.query);
      }
      if (schemas.params) {
        req.params = parsePart(schemas.params, req.params) as any;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

