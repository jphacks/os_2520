import { Request, Response } from 'express';
import { createQuizService } from '../services/quizService';

export const createQuizController = (service = createQuizService({} as any)) => {
  // POST /quizzes - クイズ作成・出題
  const postQuiz = async (req: Request, res: Response) => {
    const { questionText, options } = req.body ?? {};
    const user = (req as any).user;

    // 認証チェック
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // バリデーション: 必須フィールドのチェック
    if (!questionText) {
      return res.status(400).json({
        errors: [{ field: 'questionText', message: 'クイズの問題文は必須です。' }],
      });
    }

    if (!options || !Array.isArray(options)) {
      return res.status(400).json({
        errors: [{ field: 'options', message: '選択肢は配列形式で必須です。' }],
      });
    }

    if (options.length < 2) {
      return res.status(400).json({
        errors: [{ field: 'options', message: '選択肢は2つ以上必要です。' }],
      });
    }

    // バリデーション: 各選択肢の形式チェック
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      if (!option.optionText || typeof option.optionText !== 'string') {
        return res.status(400).json({
          errors: [{ field: `options[${i}].optionText`, message: '選択肢のテキストは必須です。' }],
        });
      }
      if (typeof option.isCorrect !== 'boolean') {
        return res.status(400).json({
          errors: [
            { field: `options[${i}].isCorrect`, message: '選択肢の正解フラグ（isCorrect）は必須です。' },
          ],
        });
      }
    }

    try {
      const result = await service.createNewQuiz(user.userId, questionText, options);
      return res.status(201).json(result);
    } catch (err: any) {
      console.error('postQuiz error:', err);

      // ロール権限エラー
      if (err.code === 'FORBIDDEN') {
        return res.status(403).json({
          errors: [{ field: 'general', message: err.message }],
        });
      }

      // その他のバリデーションエラー
      if (err.message) {
        return res.status(400).json({
          errors: [{ field: 'general', message: err.message }],
        });
      }

      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  // GET /quizzes/pending - 未回答クイズ取得
  const getPendingQuiz = async (req: Request, res: Response) => {
    const user = (req as any).user;

    // 認証チェック
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const result = await service.getPendingQuiz(user.userId);
      return res.status(200).json(result);
    } catch (err: any) {
      console.error('getPendingQuiz error:', err);

      // エラーメッセージがある場合
      if (err.message) {
        return res.status(400).json({
          errors: [{ field: 'general', message: err.message }],
        });
      }

      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  // POST /quizzes/:quizId/answer - クイズ回答
  const postQuizAnswer = async (req: Request, res: Response) => {
    const { quizId } = req.params;
    const { selectedOptionId, message } = req.body ?? {};
    const user = (req as any).user;

    // 認証チェック
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // バリデーション: 必須フィールドのチェック
    if (!selectedOptionId) {
      return res.status(400).json({
        errors: [{ field: 'selectedOptionId', message: '選択肢IDは必須です。' }],
      });
    }

    try {
      const result = await service.answerQuiz(user.userId, quizId, selectedOptionId, message);
      return res.status(200).json(result);
    } catch (err: any) {
      console.error('postQuizAnswer error:', err);

      // NOT_FOUND エラー
      if (err.code === 'NOT_FOUND') {
        return res.status(404).json({
          errors: [{ field: 'general', message: err.message }],
        });
      }

      // CONFLICT エラー (回答済み)
      if (err.code === 'CONFLICT') {
        return res.status(409).json({
          errors: [{ field: 'general', message: err.message }],
        });
      }

      // その他のバリデーションエラー
      if (err.message) {
        return res.status(400).json({
          errors: [{ field: 'general', message: err.message }],
        });
      }

      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  return { postQuiz, getPendingQuiz, postQuizAnswer } as const;
};
