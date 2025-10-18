import { Request, Response } from 'express';
import { createGroupService } from '../services/groupService';

export const createGroupController = (service = createGroupService({} as any)) => {
  // POST /groups - 新規グループ作成
  const postGroup = async (req: Request, res: Response) => {
    // デバッグログ: リクエストボディの内容を確認
    console.log('=== POST /groups デバッグ ===');
    console.log('req.body:', req.body);
    console.log('req.body type:', typeof req.body);
    console.log('req.headers:', req.headers);

    const { groupName, password, alertFrequencyDays } = req.body ?? {};
    console.log('groupName:', groupName, 'type:', typeof groupName);
    console.log('password:', password, 'type:', typeof password);
    console.log('alertFrequencyDays:', alertFrequencyDays, 'type:', typeof alertFrequencyDays);

    const user = (req as any).user;
    console.log('user:', user);

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

  return { postGroup } as const;
};
