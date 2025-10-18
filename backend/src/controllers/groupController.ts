import { Request, Response } from 'express';
import { createGroupService } from '../services/groupService';

export const createGroupController = (service = createGroupService({} as any)) => {
  // POST /groups - 新規グループ作成
  const postGroup = async (req: Request, res: Response) => {
    const { groupName, password, alertFrequencyDays } = req.body ?? {};
    const user = (req as any).user;

    // 認証チェック
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // バリデーション: 必須フィールドのチェック
    if (!groupName) {
      console.log('groupName validation failed - returning error');
      return res.status(400).json({
        errors: [{ field: 'groupName', message: 'グループ名は必須です。' }],
      });
    }

    if (!password) {
      return res.status(400).json({
        errors: [{ field: 'password', message: 'パスワードは必須です。' }],
      });
    }

    if (alertFrequencyDays === undefined || alertFrequencyDays === null) {
      return res.status(400).json({
        errors: [{ field: 'alertFrequencyDays', message: 'アラート頻度は必須です。' }],
      });
    }

    // バリデーション: パスワードの長さ
    if (password.length < 8) {
      return res.status(400).json({
        errors: [{ field: 'password', message: 'パスワードは8文字以上である必要があります。' }],
      });
    }

    // バリデーション: alertFrequencyDaysが0.5以上の数値
    if (typeof alertFrequencyDays !== 'number' || alertFrequencyDays < 0.5) {
      return res.status(400).json({
        errors: [{ field: 'alertFrequencyDays', message: 'アラート頻度は0.5日以上である必要があります。' }],
      });
    }

    try {
      const group = await service.createNewGroup(user.userId, groupName, password, alertFrequencyDays);
      return res.status(201).json({
        id: group.id,
        groupId: group.groupId,
        groupName: group.groupName,
      });
    } catch (err: any) {
      console.error('postGroup error:', err);

      // サービス層から投げられたエラーメッセージを処理
      if (err.message) {
        return res.status(400).json({
          errors: [{ field: 'general', message: err.message }],
        });
      }

      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  // POST /groups/join - グループ参加
  const postGroupJoin = async (req: Request, res: Response) => {
    const { groupId, password } = req.body ?? {};
    const user = (req as any).user;

    // 認証チェック
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // バリデーション: 必須フィールドのチェック
    if (!groupId) {
      return res.status(400).json({
        errors: [{ field: 'groupId', message: 'グループIDは必須です。' }],
      });
    }

    if (!password) {
      return res.status(400).json({
        errors: [{ field: 'password', message: 'パスワードは必須です。' }],
      });
    }

    try {
      const result = await service.joinGroup(user.userId, groupId, password);
      return res.status(200).json(result);
    } catch (err: any) {
      console.error('postGroupJoin error:', err);

      // エラーメッセージに応じてステータスコードを変更
      if (err.message === 'グループが見つかりません。' || err.message === 'パスワードが正しくありません。') {
        return res.status(404).json({
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

  // GET /groups/stats/members - グループメンバーの正答率ランキングを取得
  const getGroupStatsMembers = async (req: Request, res: Response) => {
    const user = (req as any).user;

    // 認証チェック
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const stats = await service.getMemberStats(user.userId);
      return res.status(200).json(stats);
    } catch (err: any) {
      console.error('getGroupStatsMembers error:', err);

      // グループに所属していない場合は404を返す
      if (err.message === 'グループに所属していません。') {
        return res.status(404).json({
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

  return { postGroup, postGroupJoin, getGroupStatsMembers } as const;
};
