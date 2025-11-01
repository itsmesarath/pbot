/**
 * Health Check Routes
 */

import express, { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /health
 * Simple health check
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/ready
 * Readiness check
 */
router.get('/ready', (req: Request, res: Response) => {
  res.json({
    success: true,
    ready: true,
    timestamp: new Date().toISOString(),
  });
});

export default router;
