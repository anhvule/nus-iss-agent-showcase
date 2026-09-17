import express, { type Application, type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { corsOrigins } from './config/env.js';
import { healthRouter } from './routes/health.js';

/**
 * Build and configure the Express application.
 *
 * This is the single composition point for HTTP wiring: middleware, routes and
 * error handling. Business logic lives in service modules (added by later
 * specifications), never in this file or in route handlers directly.
 */
export function createApp(): Application {
  const app = express();

  app.use(cors({ origin: corsOrigins() }));
  app.use(express.json());

  // READ: liveness / health.
  app.use('/api/health', healthRouter);

  // 404 fallback.
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // Centralised error handler. Kept minimal for the foundation; write
  // operations added later must still validate independently before this point.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('[error]', message);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}
