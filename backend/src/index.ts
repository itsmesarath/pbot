/**
 * Main Server Entry Point
 */

import 'dotenv/config';
import { createApp } from './api/app';
import pino from 'pino';

const logger = pino();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const app = createApp();

app.listen(PORT, () => {
  logger.info({ port: PORT, host: HOST }, 'Server started');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Unhandled error handler
process.on('uncaughtException', err => {
  logger.error({ error: err }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', reason => {
  logger.error({ reason }, 'Unhandled rejection');
  process.exit(1);
});
