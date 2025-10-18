import * as line from "@line/bot-sdk";

/**
 * 緊急通知用のメッセージを作成（FlexMessage）
 * @param grandparentName - 通知を送った祖父母の名前
 * @returns LINEメッセージ配列
 */
export const buildEmergencyAlertMessage = (
  grandparentName: string
): line.messagingApi.Message[] => {
  return [
    {
      type: "flex",
      altText: `【緊急通知】${grandparentName}さんから緊急の連絡があります`,
      contents: {
        type: "bubble",
        size: "mega",
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "🚨",
                  size: "xl",
                  flex: 0,
                  margin: "none",
                },
                {
                  type: "text",
                  text: "緊急通知",
                  weight: "bold",
                  color: "#ffffff",
                  size: "xl",
                  margin: "md",
                },
              ],
            },
          ],
          backgroundColor: "#DC143C",
          paddingAll: "20px",
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `${grandparentName}さんから`,
              size: "sm",
              color: "#999999",
              margin: "md",
            },
            {
              type: "text",
              text: "緊急の連絡があります",
              size: "xl",
              weight: "bold",
              margin: "md",
              wrap: true,
            },
            {
              type: "separator",
              margin: "xl",
            },
            {
              type: "box",
              layout: "vertical",
              margin: "xl",
              spacing: "sm",
              contents: [
                {
                  type: "text",
                  text: "すぐに確認して、連絡を取ってください。",
                  size: "md",
                  wrap: true,
                  color: "#333333",
                },
              ],
            },
          ],
          paddingAll: "20px",
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "⚠️ この通知は緊急性が高い内容です",
              size: "xs",
              color: "#FF6347",
              align: "center",
            },
          ],
          paddingAll: "10px",
        },
      },
    },
  ];
};

/**
 * クイズ通知用のメッセージを作成（FlexMessage）
 *
 * @param grandparentName - クイズを作成した祖父母の名前
 * @param quizText - クイズの問題文
 * @param quizUrl - クイズ回答画面へのURL（省略可能）
 * @returns LINEメッセージ配列
 */
export const buildQuizNotificationMessage = (
  grandparentName: string,
  quizText: string,
  quizUrl?: string
): line.messagingApi.Message[] => {
  return [
    {
      type: "flex",
      altText: `${grandparentName}さんから新しいクイズが届きました！`,
      contents: {
        type: "bubble",
        size: "mega",
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "📝",
                  size: "xl",
                  flex: 0,
                  margin: "none",
                },
                {
                  type: "text",
                  text: "新しいクイズ",
                  weight: "bold",
                  color: "#ffffff",
                  size: "xl",
                  margin: "md",
                },
              ],
            },
          ],
          backgroundColor: "#4169E1",
          paddingAll: "20px",
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `${grandparentName}さんから`,
              size: "sm",
              color: "#999999",
              margin: "md",
            },
            {
              type: "box",
              layout: "vertical",
              margin: "lg",
              spacing: "sm",
              contents: [
                {
                  type: "box",
                  layout: "baseline",
                  spacing: "sm",
                  contents: [
                    {
                      type: "text",
                      text: "Q.",
                      color: "#4169E1",
                      size: "lg",
                      weight: "bold",
                      flex: 0,
                    },
                    {
                      type: "text",
                      text: quizText,
                      wrap: true,
                      color: "#333333",
                      size: "md",
                      flex: 1,
                      margin: "sm",
                    },
                  ],
                },
              ],
            },
            {
              type: "separator",
              margin: "xl",
            },
            {
              type: "box",
              layout: "vertical",
              margin: "lg",
              spacing: "sm",
              contents: [
                {
                  type: "text",
                  text: "💡 クイズに答えて、おじいちゃん・おばあちゃんとコミュニケーションを取りましょう！",
                  wrap: true,
                  color: "#666666",
                  size: "xs",
                },
              ],
            },
          ],
          paddingAll: "20px",
        },
        footer: quizUrl
          ? {
              type: "box",
              layout: "vertical",
              spacing: "sm",
              contents: [
                {
                  type: "button",
                  style: "primary",
                  height: "sm",
                  action: {
                    type: "uri",
                    label: "クイズに回答する",
                    uri: quizUrl,
                  },
                  color: "#4169E1",
                },
              ],
              flex: 0,
            }
          : {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "アプリを開いてクイズに回答してください",
                  size: "xs",
                  color: "#666666",
                  align: "center",
                },
              ],
              paddingAll: "10px",
            },
      },
    },
  ];
};

/**
 * クイズ未出題アラート用のメッセージを作成
 *
 * ⚠️ TODO: 後で実装してください
 *
 * @param daysSinceLastQuiz - 最終クイズからの経過日数
 * @returns LINEメッセージ配列
 */
export const buildNoQuizAlertMessage = (
  daysSinceLastQuiz: number
): line.messagingApi.Message[] => {
  // TODO: アラート通知のFlexMessageを実装
  return [
    {
      type: "text",
      text: `最後のクイズから${daysSinceLastQuiz}日が経過しています。新しいクイズを作成してみませんか？`,
    },
  ];
};
