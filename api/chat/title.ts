import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handle } from '../handler';

export default function handler(req: VercelRequest, res: VercelResponse): void {
  handle(req, res);
}
