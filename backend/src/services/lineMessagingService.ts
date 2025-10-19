import * as line from '@line/bot-sdk';

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? '';

// LINE Bot クライアントの初期化
const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
});

/**
 * LINE メッセージ送信の汎用関数
 *
 * @param lineUserId - 送信先のLINEユーザーID
 * @param messages - 送信するメッセージ配列（テキスト、FlexMessage等）
 */
export const sendLineMessage = async (
  lineUserId: string,
  messages: line.messagingApi.Message[]
): Promise<void> => {
  if (!LINE_CHANNEL_ACCESS_TOKEN || LINE_CHANNEL_ACCESS_TOKEN === 'YOUR_CHANNEL_ACCESS_TOKEN_HERE') {
    console.warn('LINE_CHANNEL_ACCESS_TOKEN が設定されていません。メッセージ送信をスキップします。');
    return;
  }

  try {
    await client.pushMessage({
      to: lineUserId,
      messages,
    });
    console.log(`LINE メッセージ送信成功: ${lineUserId}`);
  } catch (error: any) {
    console.error(`LINE メッセージ送信エラー (${lineUserId}):`, error.message);
    throw error;
  }
};

/**
 * 複数のユーザーに一括送信
 *
 * @param lineUserIds - 送信先のLINEユーザーID配列
 * @param messages - 送信するメッセージ配列
 * @returns 成功数と失敗数
 */
export const sendLineMessageBulk = async (
  lineUserIds: string[],
  messages: line.messagingApi.Message[]
): Promise<{ successCount: number; failureCount: number }> => {
  let successCount = 0;
  let failureCount = 0;

  for (const lineUserId of lineUserIds) {
    try {
      await sendLineMessage(lineUserId, messages);
      successCount++;
    } catch (error) {
      failureCount++;
      // エラーが発生しても処理を継続
    }
  }

  return { successCount, failureCount };
};
