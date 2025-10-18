import { Request, Response } from 'express';
import { createAlertService } from '../services/alertService';

export const createAlertController = (service = createAlertService({} as any)) => {
  // POST /alerts/emergency - 緊急通知発動
  const postEmergencyAlert = async (req: Request, res: Response) => {
    const user = (req as any).user;

    // 認証チェック
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      await service.sendEmergencyAlert(user.userId, user.role);
      // 204 No Content: ボディなしで成功を返す
      return res.status(204).send();
    } catch (err: any) {
      console.error('postEmergencyAlert error:', err);

      // ロールエラー（FORBIDDEN）
      if (err.code === 'FORBIDDEN') {
        return res.status(403).json({
          errors: [{ field: 'general', message: err.message }],
        });
      }

      if (err.message) {
        return res.status(400).json({
          errors: [{ field: 'general', message: err.message }],
        });
      }

      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  return { postEmergencyAlert } as const;
};
