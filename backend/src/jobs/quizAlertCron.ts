import cron from 'node-cron';
import { createBatchService } from '../services/batchService';

const CRON_SCHEDULE = process.env.QUIZ_ALERT_CRON_SCHEDULE || '0 * * * *';

/**
 * クイズ未出題アラート通知のcronジョブを初期化
 */
export const initQuizAlertCron = () => {
  console.log(`[Cron] クイズ未出題アラートcronジョブを初期化します (スケジュール: ${CRON_SCHEDULE})`);

  // cronスケジュールの検証
  if (!cron.validate(CRON_SCHEDULE)) {
    console.error(`[Cron] 無効なcronスケジュール: ${CRON_SCHEDULE}`);
    throw new Error(`Invalid cron schedule: ${CRON_SCHEDULE}`);
  }

  // cronジョブを設定
  const task = cron.schedule(
    CRON_SCHEDULE,
    async () => {
      console.log('[Cron] クイズアラート関連cronジョブを実行します');

      try {
        const batchService = createBatchService();

        // 1. 家族向けクイズ未出題アラート処理
        console.log('[Cron] 家族向けクイズ未出題アラート処理を開始...');
        const familyAlertResult = await batchService.checkAndSendQuizAlerts();
        console.log('[Cron] 家族向けアラート処理完了:', familyAlertResult);

        // 2. 祖父母向けクイズ出題リマインダー処理
        console.log('[Cron] 祖父母向けクイズリマインダー処理を開始...');
        const grandparentReminderResult = await batchService.checkAndSendGrandparentQuizReminders();
        console.log('[Cron] 祖父母向けリマインダー処理完了:', grandparentReminderResult);

        console.log('[Cron] 全cronジョブ実行完了');
      } catch (error: any) {
        console.error('[Cron] cronジョブ実行中にエラーが発生しました:', error.message);
        // エラーが発生しても次回の実行は継続
      }
    },
    {
      timezone: 'Asia/Tokyo', // タイムゾーンを日本時間に設定
    }
  );

  console.log('[Cron] クイズ未出題アラートcronジョブを開始します');
  task.start();

  return task;
};
