import { Request, Response } from 'express';
import { createAuthService } from '../services/authService';

export const createAuthController = (service = createAuthService()) => {
  const postLineAuth = async (req: Request, res: Response) => {
    const { code } = req.body ?? {};
    if (!code) return res.status(400).json({ error: 'code is required' });

    try {
      const result = await service.loginWithLine(code);

      // JWTトークンをhttpOnly Cookieに設定（XSS攻撃対策）
      res.cookie('auth_token', result.token, {
        httpOnly: true,  // JavaScriptからアクセス不可
        secure: process.env.NODE_ENV === 'production',  // 本番環境ではHTTPS必須
        sameSite: 'strict',  // CSRF攻撃対策
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7日間（ミリ秒）
      });

      // レスポンスボディにはトークンを含めず、isNewUserのみ返す
      return res.status(200).json({ isNewUser: result.isNewUser });
    } catch (err: any) {
      if (err && err.code === 'BAD_REQUEST') {
        return res.status(400).json({ error: err.message });
      }
      if (err && (err.code === 'UNAUTHORIZED' || err.message === 'Invalid authorization code')) {
        return res.status(401).json({ error: 'invalid authorization code' });
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

      // 新しいJWTトークンをhttpOnly Cookieに設定（roleが変更された可能性があるため）
      res.cookie('auth_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(200).json({
        userId: result.user.id,
        displayName: result.user.displayName,
        role: result.user.role
      });
    } catch (err: any) {
      if (err && err.code === 'BAD_REQUEST') return res.status(400).json({ error: err.message });
      console.error('putMyProfile error:', err);
      return res.status(500).json({ error: 'internal server error' });
    }
  };

  /**
   * GET /users/me - 現在のユーザー情報を取得
   * フロントエンドがページリロード時に認証状態を復元するために使用
   * グループ所属情報も含めて返す
   */
  const getMe = async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user || !user.userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
      // Prismaを使ってユーザー情報とグループ所属情報を取得
      const prisma = (await import('../prismaClient')).default;
      const userWithGroup = await prisma.user.findUnique({
        where: { id: user.userId },
        include: {
          groupMemberships: {
            include: {
              group: true
            }
          }
        }
      });

      if (!userWithGroup) {
        return res.status(404).json({ error: 'User not found' });
      }

      // グループに所属しているかチェック
      const hasGroup = userWithGroup.groupMemberships.length > 0;
      const groupId = hasGroup ? userWithGroup.groupMemberships[0].group.id : null;

      return res.status(200).json({
        userId: user.userId,
        role: user.role,
        lineId: user.lineId,
        hasGroup: hasGroup,
        groupId: groupId
      });
    } catch (error) {
      console.error('getMe error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  return { postLineAuth, putMyProfile, getMe } as const;
};
