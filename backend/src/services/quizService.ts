import { sendLineMessageBulk } from "./lineMessagingService";
import { buildQuizNotificationMessage, buildQuizRequestHandledMessage } from "./lineMessageBuilder";

export const createQuizService = (quizRepository: {
  createQuiz: (data: {
    groupId: string;
    grandparentId: string;
    questionText: string;
    options: { optionText: string; isCorrect: boolean }[];
  }) => Promise<any>;
  getUserById: (userId: string) => Promise<any | null>;
  getGroupMembersByGroupId: (groupId: string) => Promise<any[]>;
  getUserGroupMembership: (userId: string) => Promise<any | null>;
  getPendingQuiz: (userId: string, groupId: string) => Promise<any | null>;
  getQuizById: (quizId: string) => Promise<any | null>;
  getQuizOptionById: (optionId: string) => Promise<any | null>;
  checkExistingAnswer: (quizId: string, userId: string) => Promise<any | null>;
  createAnswer: (data: {
    quizId: string;
    familyMemberId: string;
    selectedOptionId: string;
    isCorrect: boolean;
    message?: string;
  }) => Promise<any>;
  getQuizHistory: (
    groupId: string,
    page: number,
    limit: number
  ) => Promise<{ quizzes: any[]; total: number }>;
  updateUserPoints: (userId: string, points: number) => Promise<any>;
  getOldestPendingQuizRequest: (groupId: string) => Promise<any | null>;
  markRequestAsHandled: (requestId: string, quizId: string) => Promise<any>;
}) => {
  // クイズを作成する
  const createNewQuiz = async (
    userId: string,
    questionText: string,
    options: { optionText: string; isCorrect: boolean }[]
  ) => {
    // ユーザー情報を取得
    const user = await quizRepository.getUserById(userId);
    if (!user) {
      throw new Error("ユーザーが見つかりません。");
    }

    // ロール権限チェック (grandparentロールのみ)
    if (user.role !== "grandparent") {
      const error: any = new Error(
        "クイズ作成はgrandparentロールのみ実行できます。"
      );
      error.code = "FORBIDDEN";
      throw error;
    }

    // ユーザーが所属するグループを取得
    const groupMembership = await quizRepository.getUserGroupMembership(userId);
    if (!groupMembership) {
      throw new Error("グループに所属していません。");
    }

    // バリデーション: questionTextの必須チェック
    if (!questionText || questionText.trim().length === 0) {
      throw new Error("クイズの問題文は必須です。");
    }

    // バリデーション: questionTextの長さチェック (100文字以内)
    if (questionText.length > 100) {
      throw new Error("クイズの問題文は100文字以内である必要があります。");
    }

    // バリデーション: optionsの必須チェック
    if (!options || options.length < 2) {
      throw new Error("選択肢は2つ以上必要です。");
    }

    // バリデーション: 正解が1つ以上存在するかチェック
    const hasCorrectAnswer = options.some((opt) => opt.isCorrect === true);
    if (!hasCorrectAnswer) {
      throw new Error("正解の選択肢が1つ以上必要です。");
    }

    // バリデーション: 各選択肢のテキストが空でないかチェック
    for (const option of options) {
      if (!option.optionText || option.optionText.trim().length === 0) {
        throw new Error("選択肢のテキストは空にできません。");
      }
    }

    // クイズを作成
    const quiz = await quizRepository.createQuiz({
      groupId: groupMembership.groupId,
      grandparentId: userId,
      questionText: questionText.trim(),
      options,
    });

    // 未対応のクイズリクエストがあれば紐付け
    try {
      const oldestRequest = await quizRepository.getOldestPendingQuizRequest(
        groupMembership.groupId
      );

      if (oldestRequest) {
        // リクエストを処理済みにする
        await quizRepository.markRequestAsHandled(oldestRequest.id, quiz.id);

        // リクエスト送信者にLINE通知を送信
        if (oldestRequest.user?.lineId) {
          const requestNotificationMessage = buildQuizRequestHandledMessage(
            oldestRequest.content,
            `${process.env.FRONTEND_URL || "https://your-app.com"}/quiz/${quiz.id}`
          );
          await sendLineMessageBulk([oldestRequest.user.lineId], requestNotificationMessage);
          console.log(`リクエスト対応通知を送信しました: ${oldestRequest.user.displayName}`);
        }
      }
    } catch (requestError: any) {
      console.error("リクエスト紐付けエラー:", requestError);
      // リクエスト紐付けエラーは警告として扱い、クイズ作成は成功とする
    }

    // 家族メンバーを取得（LINE通知用）
    const familyMembers = await quizRepository.getGroupMembersByGroupId(
      groupMembership.groupId
    );

    // LINE通知を送信
    try {
      // 祖父母の名前を取得
      const grandparentName = user.displayName || "祖父母";

      // クイズ回答URLを生成
      const frontendUrl = process.env.FRONTEND_URL || "https://your-app.com";
      const quizUrl = `${frontendUrl}/quiz/${quiz.id}`;

      // メッセージビルダーでクイズ通知メッセージを作成
      const messages = buildQuizNotificationMessage(
        grandparentName,
        questionText,
        quizUrl
      );

      // grandparent以外の家族メンバーにのみ通知
      const familyLineUserIds = familyMembers
        .filter((member) => member.user?.role !== "grandparent") // grandparentを除外
        .map((member) => member.user?.lineId)
        .filter((lineId): lineId is string => !!lineId);

      if (familyLineUserIds.length > 0) {
        // 一括送信
        const result = await sendLineMessageBulk(familyLineUserIds, messages);
        console.log(
          `LINEクイズ通知送信完了: 成功 ${result.successCount}件, 失敗 ${result.failureCount}件`
        );
      } else {
        console.warn("送信先の家族メンバーが見つかりませんでした。");
      }
    } catch (lineError: any) {
      console.error("LINE通知送信エラー:", lineError);
      // LINE送信エラーは警告として扱い、クイズ作成は成功とする
    }

    return {
      quizId: quiz.id,
      message: "Quiz created successfully",
    };
  };

  // 未回答クイズを取得する
  const getPendingQuiz = async (userId: string) => {
    // ユーザーが所属するグループを取得
    const groupMembership = await quizRepository.getUserGroupMembership(userId);
    if (!groupMembership) {
      throw new Error("グループに所属していません。");
    }

    // 未回答の最新クイズを取得
    const pendingQuiz = await quizRepository.getPendingQuiz(
      userId,
      groupMembership.groupId
    );

    // 未回答クイズがない場合はnullを返す
    if (!pendingQuiz) {
      return null;
    }

    // レスポンス形式に整形
    return {
      quizId: pendingQuiz.id,
      questionText: pendingQuiz.questionText,
      options: pendingQuiz.options.map((opt: any) => ({
        id: opt.id,
        optionText: opt.optionText,
      })),
      grandparent: {
        id: pendingQuiz.grandparent.id,
        displayName: pendingQuiz.grandparent.displayName,
      },
    };
  };

  // クイズに回答する
  const answerQuiz = async (
    userId: string,
    quizId: string,
    selectedOptionId: string,
    message?: string
  ) => {
    // クイズの存在確認
    const quiz = await quizRepository.getQuizById(quizId);
    if (!quiz) {
      const error: any = new Error("クイズが見つかりません。");
      error.code = "NOT_FOUND";
      throw error;
    }

    // 選択肢の存在確認
    const selectedOption = await quizRepository.getQuizOptionById(
      selectedOptionId
    );
    if (!selectedOption) {
      const error: any = new Error("選択肢が見つかりません。");
      error.code = "NOT_FOUND";
      throw error;
    }

    // 選択肢がこのクイズに属しているか確認
    if (selectedOption.quizId !== quizId) {
      throw new Error("選択した選択肢はこのクイズのものではありません。");
    }

    // 既に回答済みかチェック
    const existingAnswer = await quizRepository.checkExistingAnswer(
      quizId,
      userId
    );
    if (existingAnswer) {
      const error: any = new Error("既にこのクイズに回答済みです。");
      error.code = "CONFLICT";
      throw error;
    }

    // 正解かどうかを判定
    const isCorrect = selectedOption.isCorrect;

    // 回答を保存
    await quizRepository.createAnswer({
      quizId,
      familyMemberId: userId,
      selectedOptionId,
      isCorrect,
      message: message || undefined,
    });

    // 正解の場合、ポイントを1付与
    if (isCorrect) {
      const user = await quizRepository.getUserById(userId);
      if (user) {
        await quizRepository.updateUserPoints(userId, user.points + 1);
      }
    }

    // 正解の選択肢IDを取得
    const correctOption = quiz.options.find(
      (opt: any) => opt.isCorrect === true
    );

    return {
      isCorrect,
      correctOptionId: correctOption?.id || null,
    };
  };

  // 過去クイズ一覧を取得する
  const getQuizHistory = async (
    userId: string,
    page: number = 1,
    limit: number = 20
  ) => {
    // ユーザーが所属するグループを取得
    const groupMembership = await quizRepository.getUserGroupMembership(userId);
    if (!groupMembership) {
      throw new Error("グループに所属していません。");
    }

    // 過去クイズ一覧を取得
    const { quizzes, total } = await quizRepository.getQuizHistory(
      groupMembership.groupId,
      page,
      limit
    );

    // レスポンス形式に整形
    const formattedQuizzes = quizzes.map((quiz: any) => ({
      quizId: quiz.id,
      questionText: quiz.questionText,
      createdAt: quiz.createdAt,
      grandparent: {
        id: quiz.grandparent.id,
        displayName: quiz.grandparent.displayName,
      },
      answers: quiz.answers.map((answer: any) => ({
        familyMemberId: answer.familyMember.id,
        familyMemberName: answer.familyMember.displayName,
        selectedOption: answer.selectedOption.optionText,
        isCorrect: answer.isCorrect,
        message: answer.message,
        answeredAt: answer.createdAt,
      })),
    }));

    return {
      quizzes: formattedQuizzes,
      total,
      page,
      limit,
    };
  };

  return { createNewQuiz, getPendingQuiz, answerQuiz, getQuizHistory } as const;
};
