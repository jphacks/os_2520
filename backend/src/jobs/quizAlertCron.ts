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
      console.log('[Cron] クイズ未出題アラートcronジョブを実行します');

      try {
        const batchService = createBatchService();
        const result = await batchService.checkAndSendQuizAlerts();

        console.log('[Cron] cronジョブ実行完了:', result);
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
