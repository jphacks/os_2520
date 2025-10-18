import { createBatchRepository } from '../repositories/batchRepository';
import { sendLineMessageBulk } from './lineMessagingService';
import { buildNoQuizAlertMessage } from './lineMessageBuilder';

export const createBatchService = (
  batchRepository = createBatchRepository()
) => {
  /**
   * クイズ未出題アラート通知を送信
   *
   * 全グループをチェックし、alertFrequencyDaysを超えている場合に
   * 家族メンバー（grandparent除く）にLINE通知を送信します。
   */
  const checkAndSendQuizAlerts = async () => {
    console.log('[Batch] クイズ未出題アラート処理を開始します...');

    try {
      // 全グループと最新クイズ情報を取得
      const groups = await batchRepository.getAllGroupsWithLatestQuiz();
      console.log(`[Batch] 対象グループ数: ${groups.length}`);

      let alertSentCount = 0;
      let skipCount = 0;
      let totalSuccessCount = 0;
      let totalFailureCount = 0;

      const now = new Date();

      for (const group of groups) {
        try {
          // グループの最新クイズを確認
          const latestQuiz = group.quizzes[0];

          if (!latestQuiz) {
            // クイズが一度も作成されていない場合はスキップ
            console.log(`[Batch] グループ ${group.groupName} (${group.id}): クイズ未作成のためスキップ`);
            skipCount++;
            continue;
          }

          // 最後のクイズからの経過日数を計算
          const lastQuizCreatedAt = new Date(latestQuiz.createdAt);
          const daysSinceLastQuiz =
            (now.getTime() - lastQuizCreatedAt.getTime()) / (1000 * 60 * 60 * 24);

          console.log(
            `[Batch] グループ ${group.groupName} (${group.id}): 最終クイズから${daysSinceLastQuiz.toFixed(
              1
            )}日経過 (閾値: ${group.alertFrequencyDays}日)`
          );

          // alertFrequencyDaysを超えているかチェック
          if (daysSinceLastQuiz < group.alertFrequencyDays) {
            console.log(`[Batch] グループ ${group.groupName} (${group.id}): 閾値未達のためスキップ`);
            skipCount++;
            continue;
          }

          // 家族メンバー（grandparent除く）を取得
          const familyMembers = await batchRepository.getGroupFamilyMembers(group.id);
          const familyLineUserIds = familyMembers
            .map((member) => member.user?.lineId)
            .filter((lineId): lineId is string => !!lineId);

          if (familyLineUserIds.length === 0) {
            console.log(
              `[Batch] グループ ${group.groupName} (${group.id}): 送信先の家族メンバーが見つかりません`
            );
            skipCount++;
            continue;
          }

          // FlexMessageを作成
          const messages = buildNoQuizAlertMessage(daysSinceLastQuiz);

          // LINE通知を送信
          const result = await sendLineMessageBulk(familyLineUserIds, messages);
          totalSuccessCount += result.successCount;
          totalFailureCount += result.failureCount;

          console.log(
            `[Batch] グループ ${group.groupName} (${group.id}): LINE通知送信完了 (成功: ${result.successCount}, 失敗: ${result.failureCount})`
          );

          // AlertHistoryに記録
          await batchRepository.createAlertHistory({
            groupId: group.id,
            type: 'no_quiz',
          });

          alertSentCount++;
        } catch (groupError: any) {
          console.error(
            `[Batch] グループ ${group.groupName} (${group.id}) の処理中にエラー:`,
            groupError.message
          );
          // エラーが発生しても次のグループの処理を継続
        }
      }

      console.log('[Batch] クイズ未出題アラート処理が完了しました');
      console.log(`[Batch] 処理結果: 通知送信 ${alertSentCount}件, スキップ ${skipCount}件`);
      console.log(`[Batch] LINE送信結果: 成功 ${totalSuccessCount}件, 失敗 ${totalFailureCount}件`);

      return {
        totalGroups: groups.length,
        alertSent: alertSentCount,
        skipped: skipCount,
        lineSuccess: totalSuccessCount,
        lineFailure: totalFailureCount,
      };
    } catch (error: any) {
      console.error('[Batch] クイズ未出題アラート処理でエラーが発生しました:', error.message);
      throw error;
    }
  };

  return {
    checkAndSendQuizAlerts,
  } as const;
};
