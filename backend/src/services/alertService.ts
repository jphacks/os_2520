import { sendLineMessageBulk } from './lineMessagingService';
import { buildEmergencyAlertMessage } from './lineMessageBuilder';

export const createAlertService = (alertRepository: {
  createAlertHistory: (data: { groupId: string; type: string; triggeredByUserId: string }) => Promise<any>;
  getUserGroupMembership: (userId: string) => Promise<any | null>;
  getGroupFamilyMembers: (groupId: string) => Promise<any[]>;
}) => {
  // 緊急通知を発動する
  const sendEmergencyAlert = async (userId: string, userRole: string) => {
    // ロールチェック: grandparentのみ実行可能
    if (userRole !== 'grandparent') {
      const error = new Error('この操作はgrandparentロールのみ実行できます。');
      (error as any).code = 'FORBIDDEN';
      throw error;
    }

    // ユーザーのグループメンバーシップを取得
    const membership = await alertRepository.getUserGroupMembership(userId);
    if (!membership) {
      throw new Error('グループに所属していません。');
    }

    const groupId = membership.groupId;
    const grandparentName = membership.user?.displayName || '祖父母';

    // グループの家族メンバーを取得
    const familyMembers = await alertRepository.getGroupFamilyMembers(groupId);

    // LINE通知を送信
    try {
      // メッセージビルダーで緊急通知メッセージを作成
      const messages = buildEmergencyAlertMessage(grandparentName);

      // 送信先のLINEユーザーIDリストを作成
      const lineUserIds = familyMembers
        .map((member) => member.user?.lineId)
        .filter((lineId): lineId is string => !!lineId);

      if (lineUserIds.length > 0) {
        // 一括送信
        const result = await sendLineMessageBulk(lineUserIds, messages);
        console.log(
          `LINE緊急通知送信完了: 成功 ${result.successCount}件, 失敗 ${result.failureCount}件`
        );
      } else {
        console.warn('送信先のLINEユーザーIDが見つかりませんでした。');
      }
    } catch (lineError: any) {
      console.error('LINE緊急通知送信エラー:', lineError);
      // LINE送信エラーは無視して処理を続行
    }

    // AlertHistoryにログを保存
    await alertRepository.createAlertHistory({
      groupId,
      type: 'emergency',
      triggeredByUserId: userId,
    });

    return;
  };

  return { sendEmergencyAlert } as const;
};
