import type { NextFunction, Request, Response } from 'express';
import { ApiError, type ApiErrorBody } from './api-error.js';
import { logger } from '../config/logger.js';

/**
 * 404 handler for unknown routes. Returns the shared structured error envelope
 * (FR-019).
 */
export function notFoundHandler(_req: Request, res: Response): void {
  const body: ApiErrorBody = {
    error: { code: 'NOT_FOUND', message: 'Not Found' },
  };
  res.status(404).json(body);
}

/**
 * Body-parser failures (a malformed or oversized JSON body) reach the error
 * handler as plain `Error`s carrying an HTTP status and a `type`. They are
 * caller mistakes, so mapping them to a generic 500 would both misreport the
 * cause and log a routine client error as an unhandled one. Introduced with the
 * first WRITE endpoint (Specification 05, SR-505); before that no route
 * accepted a body.
 */
function asBodyParserError(err: unknown): ApiError | null {
  if (typeof err !== 'object' || err === null || !('type' in err)) return null;
  const { type } = err as { type?: unknown };
  if (type === 'entity.too.large') {
    return new ApiError(413, 'VALIDATION_ERROR', 'Request body is too large.');
  }
  if (type === 'entity.parse.failed') {
    return ApiError.validation('Request body is not valid JSON.');
  }
  return null;
}

/**
 * Centralised error handler.
 *
 * Renders operational {@link ApiError}s into the shared envelope with their
 * status/code. Any other (unexpected) error is logged server-side and mapped to
 * a generic, sanitised 500 so internal details never reach the client (FR-020,
 * NFR-211).
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.status).json(err.toBody());
    return;
  }

  const bodyError = asBodyParserError(err);
  if (bodyError !== null) {
    res.status(bodyError.status).json(bodyError.toBody());
    return;
  }

  logger.error({ err }, 'Unhandled error');

  const body: ApiErrorBody = {
    error: { code: 'INTERNAL', message: 'Internal Server Error' },
  };
  res.status(500).json(body);
}
