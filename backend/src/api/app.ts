/**
 * Express Application Configuration
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import pino from 'pino';
import signalRoutes from './routes/signalRoutes';
import healthRoutes from './routes/healthRoutes';

const logger = pino();

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info({ method: req.method, path: req.path }, 'Request received');
    next();
  });

  // Routes
  app.use('/api/signals', signalRoutes);
  app.use('/health', healthRoutes);

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error({ error: err }, 'Unhandled error');

    const status = err.status || 500;
    const message = err.message || 'Internal server error';

    res.status(status).json({
      success: false,
      error: message,
      status,
    });
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Not found',
      path: req.path,
    });
  });

  return app;
}
