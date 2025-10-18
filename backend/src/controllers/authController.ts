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

  const putMyProfile = async (req: Request, res: Response) => {
    const body = req.body ?? {};
    const user = (req as any).user;
    if (!user || !user.userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const result = await (service as any).updateProfile(user.userId, body);
      return res.status(200).json({
        userId: result.user.id,
        displayName: result.user.displayName,
        role: result.user.role,
        token: result.token
      });
    } catch (err: any) {
      if (err && err.code === 'BAD_REQUEST') return res.status(400).json({ error: err.message });
      console.error('putMyProfile error:', err);
      return res.status(500).json({ error: 'internal server error' });
    }
  };

  return { postLineAuth, putMyProfile } as const;
};
