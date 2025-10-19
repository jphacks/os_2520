import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../lib/axios";

// API設計書に準拠した型定義
interface QuizHistoryItem {
  quizId: string;
  questionText: string;
  createdAt: string;
  answers: {
    userId: string;
    displayName: string;
    isCorrect: boolean;
    answeredAt: string;
  }[];
}

interface QuizHistoryResponse {
  quizzes: QuizHistoryItem[];
  total: number;
  page: number;
  limit: number;
}

// 表示用の型定義（既存のUIに合わせて変換）
interface QuizSummary {
  id: string;
  question: string;
  createdAt: string;
  correctRate: number; // 0-100
  answeredCount: number;
  totalCount: number;
}

function OldDashboard() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        // apiClientを使用してクイズ履歴APIを呼び出し（httpOnly Cookie使用）
        const response = await apiClient.get<QuizHistoryResponse>('/quizzes/history');

        // API設計書のレスポンス構造に対応（quizzesプロパティから取得）
        const historyData = response.data.quizzes || [];

        // 既存のUIに合わせてデータを変換
        const transformedData: QuizSummary[] = historyData.map(quiz => {
          const totalAnswers = quiz.answers.length;
          const correctAnswers = quiz.answers.filter(a => a.isCorrect).length;
          const correctRate = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

          return {
            id: quiz.quizId,
            question: quiz.questionText,
            createdAt: quiz.createdAt,
            correctRate: correctRate,
            answeredCount: totalAnswers,
            totalCount: totalAnswers, // TODO: グループメンバー総数を取得する場合は別途APIを呼ぶ
          };
        });

        setQuizzes(transformedData);
      } catch (err: any) {
        console.error("クイズ履歴取得エラー:", err);

        // 401エラーの場合はログイン画面へリダイレクト
        if (err.response && err.response.status === 401) {
          setError("認証が切れました。再度ログインしてください。");
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError("履歴の取得に失敗しました。");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const sendEmergency = async (): Promise<void> => {
    if (!confirm("本当に家族全員に緊急通知を送りますか？")) return;
    try {
      // API設計書に準拠（リクエストボディなし）
      // apiClientを使用して緊急通知APIを呼び出し（httpOnly Cookie使用）
      await apiClient.post('/alerts/emergency');
      alert("緊急通知を送信しました。");
    } catch (error) {
      console.error("緊急通知送信エラー:", error);
      alert("緊急通知の送信に失敗しました。");
    }
  };

  return (
    <div className="min-h-screen bg-line-bg p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            祖父母ダッシュボード
          </h2>

          {/* アクションボタン */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => navigate("/old")}
              className="btn-primary text-xl sm:text-2xl py-5 font-extrabold shadow-lg flex-1"
            >
              📝 クイズを作成する
            </button>
            <button
              onClick={sendEmergency}
              className="btn-danger text-lg sm:text-xl py-4"
            >
              🚨 緊急通知を送る
            </button>
          </div>
        </div>

        {/* 過去の出題一覧 */}
        <section className="card">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
            過去の出題一覧
          </h3>

          {/* ローディング状態 */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-line-green border-t-transparent"></div>
              <p className="mt-4 text-lg sm:text-xl text-gray-600">読み込み中...</p>
            </div>
          )}

          {/* エラー状態 */}
          {error && (
            <div className="bg-red-50 border-2 border-red-400 rounded-soft p-6 mb-6">
              <p className="text-lg sm:text-xl text-red-700 font-bold">{error}</p>
            </div>
          )}

          {/* 空の状態 */}
          {!loading && quizzes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl sm:text-2xl text-gray-500">過去の出題はありません</p>
              <p className="text-base sm:text-lg text-gray-400 mt-2">
                クイズを作成して、家族に出題してみましょう！
              </p>
            </div>
          )}

          {/* クイズリスト */}
          {!loading && quizzes.length > 0 && (
            <ul className="space-y-4">
              {quizzes.map((q) => (
                <li key={q.id} className="card border-2 border-gray-200 hover:border-line-green transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      {/* 作成日時 */}
                      <div className="text-sm sm:text-base text-gray-500 mb-2">
                        {new Date(q.createdAt).toLocaleString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>

                      {/* 質問文 */}
                      <div className="text-lg sm:text-xl font-bold text-gray-800 mb-3">
                        {q.question}
                      </div>

                      {/* 回答状況 */}
                      <div className="flex flex-wrap gap-4 text-base sm:text-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-line-green">正答率:</span>
                          <span className="text-gray-700 font-bold">
                            {Math.round(q.correctRate)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-600">回答者:</span>
                          <span className="text-gray-700 font-bold">
                            {q.answeredCount}/{q.totalCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 詳細ボタン */}
                    <div className="flex items-center">
                      <button
                        onClick={() => navigate(`/quiz/${q.id}`, { state: { quizId: q.id } })}
                        className="btn-secondary text-base sm:text-lg py-3 px-6 whitespace-nowrap"
                      >
                        📊 詳細を見る
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default OldDashboard;
