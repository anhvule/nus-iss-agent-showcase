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

  logger.error({ err }, 'Unhandled error');

  const body: ApiErrorBody = {
    error: { code: 'INTERNAL', message: 'Internal Server Error' },
  };
  res.status(500).json(body);
}
