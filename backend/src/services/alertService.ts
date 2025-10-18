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

    // グループの家族メンバーを取得
    const familyMembers = await alertRepository.getGroupFamilyMembers(groupId);

    // LINE通知を送信（未実装）
    try {
      // await sendLineEmergencyNotification(familyMembers);
      console.log('LINE緊急通知送信（未実装）:', familyMembers.length, 'メンバー');
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
