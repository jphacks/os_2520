import { Request, Response } from 'express';
import { createRequestService } from '../services/requestService';
import { createRequestRepository } from '../repositories/requestRepository';
import { createAuthRepository } from '../repositories/authRepository';

export const createRequestController = () => {
  const requestRepository = createRequestRepository();

  // authRepositoryの必要なメソッドを持つオブジェクトを作成
  const authRepository = createAuthRepository();

  const requestService = createRequestService(requestRepository, authRepository as any);

  // POST /requests - リクエスト送信
  const postRequest = async (req: Request, res: Response) => {
    const { requestType, content } = req.body ?? {};
    const user = (req as any).user;

    // 認証チェック
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // バリデーション: 必須フィールドのチェック
    if (!requestType) {
      return res.status(400).json({
        errors: [{ field: 'requestType', message: 'リクエストタイプは必須です。' }],
      });
    }

    if (!content) {
      return res.status(400).json({
        errors: [{ field: 'content', message: 'リクエスト内容は必須です。' }],
      });
    }

    // バリデーション: requestTypeの値チェック
    if (requestType !== 'quiz' && requestType !== 'other') {
      return res.status(400).json({
        errors: [
          {
            field: 'requestType',
            message: "リクエストタイプは 'quiz' または 'other' である必要があります。",
          },
        ],
      });
    }

    try {
      const result = await requestService.sendRequest(user.userId, requestType, content);
      return res.status(201).json(result);
    } catch (err: any) {
      console.error('postRequest error:', err);

      // ポイント不足エラー
      if (err.code === 'INSUFFICIENT_POINTS') {
        return res.status(400).json({
          errors: [{ field: 'general', message: err.message }],
        });
      }

      // その他のバリデーションエラー
      if (err.message) {
        return res.status(400).json({
          errors: [{ field: 'general', message: err.message }],
        });
      }

      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  // GET /requests/pending - 未対応クイズリクエスト取得
  const getPendingRequests = async (req: Request, res: Response) => {
    const user = (req as any).user;

    // 認証チェック
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // ユーザーのグループメンバーシップを取得
      const groupMembership = await authRepository.getUserGroupMembership(user.userId);
      if (!groupMembership) {
        return res.status(400).json({
          errors: [{ field: 'general', message: 'グループに所属していません。' }],
        });
      }

      const result = await requestService.getPendingQuizRequests(groupMembership.groupId);
      return res.status(200).json({ requests: result });
    } catch (err: any) {
      console.error('getPendingRequests error:', err);

      // エラーメッセージがある場合
      if (err.message) {
        return res.status(400).json({
          errors: [{ field: 'general', message: err.message }],
        });
      }

      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  return { postRequest, getPendingRequests } as const;
};
