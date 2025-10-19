import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

/**
 * 認証ミドルウェア
 * httpOnly CookieからJWTトークンを取得して検証する
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Cookieからトークンを取得
  const token = req.cookies?.auth_token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // トークンを検証
    const payload = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = { userId: payload.userId, role: payload.role, lineId: payload.lineId };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default authMiddleware;
