import { Request, Response } from 'express';
import { createAuthService } from '../services/authService';

export const createAuthController = (service = createAuthService()) => {
  const postLineAuth = async (req: Request, res: Response) => {
    const { idToken } = req.body ?? {};
    if (!idToken) return res.status(400).json({ error: 'idToken is required' });

    try {
      const result = await service.loginWithLine(idToken);
      return res.status(200).json({ token: result.token, isNewUser: result.isNewUser });
    } catch (err: any) {
      if (err && (err.code === 'UNAUTHORIZED' || err.message === 'Invalid idToken')) {
        return res.status(401).json({ error: 'invalid idToken' });
      }
      console.error('authController error:', err);
      return res.status(500).json({ error: 'internal server error' });
    }
  };

  return { postLineAuth } as const;
};
