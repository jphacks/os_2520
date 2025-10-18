import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const auth = (req.headers.authorization || '').trim();
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

  const token = auth.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = { userId: payload.userId };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default authMiddleware;
