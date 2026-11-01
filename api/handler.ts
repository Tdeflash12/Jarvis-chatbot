import type { Request, Response } from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { app } from '../server.js';

export function handle(req: VercelRequest, res: VercelResponse): void {
  app(req as unknown as Request, res as unknown as Response);
}
