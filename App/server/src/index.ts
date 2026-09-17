import { createApp } from './app.js';
import { env } from './config/env.js';

/**
 * Process bootstrap. Starts the HTTP listener and wires graceful shutdown.
 */
function main(): void {
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(
      `[eduagent-connect-server] listening on http://localhost:${env.PORT} (${env.NODE_ENV})`,
    );
  });

  const shutdown = (signal: string): void => {
    console.log(`[eduagent-connect-server] received ${signal}, shutting down`);
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main();
