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
      throw new Error('ユーザーが見つかりません。');
    }

    // ロール権限チェック (grandparentロールのみ)
    if (user.role !== 'grandparent') {
      const error: any = new Error('クイズ作成はgrandparentロールのみ実行できます。');
      error.code = 'FORBIDDEN';
      throw error;
    }

    // ユーザーが所属するグループを取得
    const groupMembership = await quizRepository.getUserGroupMembership(userId);
    if (!groupMembership) {
      throw new Error('グループに所属していません。');
    }

    // バリデーション: questionTextの必須チェック
    if (!questionText || questionText.trim().length === 0) {
      throw new Error('クイズの問題文は必須です。');
    }

    // バリデーション: questionTextの長さチェック (100文字以内)
    if (questionText.length > 100) {
      throw new Error('クイズの問題文は100文字以内である必要があります。');
    }

    // バリデーション: optionsの必須チェック
    if (!options || options.length < 2) {
      throw new Error('選択肢は2つ以上必要です。');
    }

    // バリデーション: 正解が1つ以上存在するかチェック
    const hasCorrectAnswer = options.some((opt) => opt.isCorrect === true);
    if (!hasCorrectAnswer) {
      throw new Error('正解の選択肢が1つ以上必要です。');
    }

    // バリデーション: 各選択肢のテキストが空でないかチェック
    for (const option of options) {
      if (!option.optionText || option.optionText.trim().length === 0) {
        throw new Error('選択肢のテキストは空にできません。');
      }
    }

    // クイズを作成
    const quiz = await quizRepository.createQuiz({
      groupId: groupMembership.groupId,
      grandparentId: userId,
      questionText: questionText.trim(),
      options,
    });

    // 家族メンバーを取得（LINE通知用）
    const familyMembers = await quizRepository.getGroupMembersByGroupId(groupMembership.groupId);

    // LINE通知を送信（後で実装）
    // TODO: LINE通知機能を実装
    // familyMembersのうち、grandparent以外のメンバーにLINE通知を送信
    // エラーが発生した場合もクイズは作成されているので、警告として扱う
    try {
      // await sendLineNotification(familyMembers, quiz);
      console.log('LINE通知送信（未実装）:', familyMembers.length, 'メンバー');
    } catch (lineError: any) {
      console.error('LINE通知送信エラー:', lineError);
      // LINE送信エラーは警告として扱い、クイズ作成は成功とする
    }

    return {
      quizId: quiz.id,
      message: 'Quiz created successfully',
    };
  };

  // 未回答クイズを取得する
  const getPendingQuiz = async (userId: string) => {
    // ユーザーが所属するグループを取得
    const groupMembership = await quizRepository.getUserGroupMembership(userId);
    if (!groupMembership) {
      throw new Error('グループに所属していません。');
    }

    // 未回答の最新クイズを取得
    const pendingQuiz = await quizRepository.getPendingQuiz(userId, groupMembership.groupId);

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
  const answerQuiz = async (userId: string, quizId: string, selectedOptionId: string, message?: string) => {
    // クイズの存在確認
    const quiz = await quizRepository.getQuizById(quizId);
    if (!quiz) {
      const error: any = new Error('クイズが見つかりません。');
      error.code = 'NOT_FOUND';
      throw error;
    }

    // 選択肢の存在確認
    const selectedOption = await quizRepository.getQuizOptionById(selectedOptionId);
    if (!selectedOption) {
      const error: any = new Error('選択肢が見つかりません。');
      error.code = 'NOT_FOUND';
      throw error;
    }

    // 選択肢がこのクイズに属しているか確認
    if (selectedOption.quizId !== quizId) {
      throw new Error('選択した選択肢はこのクイズのものではありません。');
    }

    // 既に回答済みかチェック
    const existingAnswer = await quizRepository.checkExistingAnswer(quizId, userId);
    if (existingAnswer) {
      const error: any = new Error('既にこのクイズに回答済みです。');
      error.code = 'CONFLICT';
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

    // 正解の選択肢IDを取得
    const correctOption = quiz.options.find((opt: any) => opt.isCorrect === true);

    return {
      isCorrect,
      correctOptionId: correctOption?.id || null,
    };
  };

  return { createNewQuiz, getPendingQuiz, answerQuiz } as const;
};
