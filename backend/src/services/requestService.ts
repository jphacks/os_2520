import { sendLineMessageBulk } from './lineMessagingService';
import { buildRequestNotificationMessage } from './lineMessageBuilder';

/**
 * リクエストサービスの作成
 */
export const createRequestService = (requestRepository: {
  createRequest: (data: {
    userId: string;
    groupId: string;
    requestType: 'quiz' | 'other';
    content: string;
  }) => Promise<any>;
  getPendingQuizRequests: (groupId: string) => Promise<any[]>;
  getOldestPendingQuizRequest: (groupId: string) => Promise<any | null>;
  getGrandparents: (groupId: string) => Promise<any[]>;
}, userRepository: {
  getUserById: (userId: string) => Promise<any | null>;
  getUserGroupMembership: (userId: string) => Promise<any | null>;
  updateUserPoints: (userId: string, points: number) => Promise<any>;
}) => {
  /**
   * リクエストを送信
   */
  const sendRequest = async (
    userId: string,
    requestType: 'quiz' | 'other',
    content: string
  ) => {
    // ユーザー情報を取得
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new Error('ユーザーが見つかりません。');
    }

    // グループメンバーシップを取得
    const groupMembership = await userRepository.getUserGroupMembership(userId);
    if (!groupMembership) {
      throw new Error('グループに所属していません。');
    }

    // ポイントチェック（10ポイント以上必要）
    if (user.points < 10) {
      const error: any = new Error(
        `ポイントが不足しています。現在のポイント: ${user.points}`
      );
      error.code = 'INSUFFICIENT_POINTS';
      throw error;
    }

    // バリデーション: contentが空でないかチェック
    if (!content || content.trim().length === 0) {
      throw new Error('リクエスト内容は必須です。');
    }

    // バリデーション: requestTypeの値チェック
    if (requestType !== 'quiz' && requestType !== 'other') {
      throw new Error("リクエストタイプは 'quiz' または 'other' である必要があります。");
    }

    // ポイントを10消費
    await userRepository.updateUserPoints(userId, user.points - 10);

    // リクエストを作成
    const request = await requestRepository.createRequest({
      userId,
      groupId: groupMembership.groupId,
      requestType,
      content: content.trim(),
    });

    // requestType='other'の場合、祖父母にLINE通知
    if (requestType === 'other') {
      try {
        const grandparents = await requestRepository.getGrandparents(
          groupMembership.groupId
        );

        if (grandparents.length > 0) {
          const grandparentLineIds = grandparents
            .map((gp) => gp.user?.lineId)
            .filter((lineId): lineId is string => !!lineId);

          if (grandparentLineIds.length > 0) {
            const messages = buildRequestNotificationMessage(
              user.displayName,
              content
            );
            const result = await sendLineMessageBulk(grandparentLineIds, messages);
            console.log(
              `LINEリクエスト通知送信完了: 成功 ${result.successCount}件, 失敗 ${result.failureCount}件`
            );
          }
        }
      } catch (lineError: any) {
        console.error('LINE通知送信エラー:', lineError);
        // LINE送信エラーは警告として扱い、リクエスト作成は成功とする
      }
    }

    return {
      requestId: request.id,
      remainingPoints: user.points - 10,
    };
  };

  /**
   * 未対応のクイズリクエストを取得
   */
  const getPendingQuizRequests = async (groupId: string) => {
    const requests = await requestRepository.getPendingQuizRequests(groupId);

    // レスポンス形式に整形
    return requests.map((request: any) => ({
      requestId: request.id,
      content: request.content,
      requesterName: request.user.displayName,
      createdAt: request.createdAt,
    }));
  };

  /**
   * 最も古い未対応クイズリクエストを取得
   */
  const getOldestPendingQuizRequest = async (groupId: string) => {
    const request = await requestRepository.getOldestPendingQuizRequest(groupId);

    if (!request) {
      return null;
    }

    return {
      requestId: request.id,
      content: request.content,
      requesterName: request.user.displayName,
      requesterLineId: request.user.lineId,
      createdAt: request.createdAt,
    };
  };

  return {
    sendRequest,
    getPendingQuizRequests,
    getOldestPendingQuizRequest,
  } as const;
};
