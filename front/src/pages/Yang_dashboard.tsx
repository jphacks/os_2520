import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../lib/axios";

// API設計書に準拠した型定義

// GET /quizzes/pending のレスポンス型（単一クイズまたはnull）
interface PendingQuizResponse {
  quizId: string;
  questionText: string;
  options: { id: string; optionText: string }[];
  grandparent: {
    userId: string;
    displayName: string;
  };
}

// GET /quizzes/history のレスポンス型
interface QuizHistoryResponse {
  quizzes: {
    quizId: string;
    questionText: string;
    createdAt: string;
    answers: {
      userId: string;
      displayName: string;
      isCorrect: boolean;
      answeredAt: string;
    }[];
  }[];
  total: number;
  page: number;
  limit: number;
}

// GET /groups/stats/members のレスポンス型
interface GroupStatsResponse {
  members: {
    userId: string;
    displayName: string;
    correctRate: number;
  }[];
}

// 表示用の型定義
interface PendingQuiz {
  quizId: string;
  question: string;
  choices: { id: string; text: string }[];
  createdAt: string;
}

interface HistoryItem {
  id: string;
  question: string;
  isCorrect: boolean;
  answeredAt: string;
}

interface MemberStat {
  id: string;
  name: string;
  correctRate: number; // 0-100
}

export default function YangDashboard() {
  const [pending, setPending] = useState<PendingQuiz[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [members, setMembers] = useState<MemberStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        // apiClientを使用して複数APIを並行実行（httpOnly Cookie使用）
        const [pendingRes, historyRes, membersRes] = await Promise.all([
          apiClient.get<PendingQuizResponse | null>('/quizzes/pending'),
          apiClient.get<QuizHistoryResponse>('/quizzes/history'),
          apiClient.get<GroupStatsResponse>('/groups/stats/members'),
        ]);

        // /quizzes/pending のレスポンス処理（単一クイズまたはnull → 配列に変換）
        const pendingData = pendingRes.data;
        if (pendingData) {
          setPending([{
            quizId: pendingData.quizId,
            question: pendingData.questionText,
            choices: pendingData.options.map(opt => ({
              id: opt.id,
              text: opt.optionText
            })),
            createdAt: new Date().toISOString(), // APIレスポンスにcreatedAtがない場合
          }]);
        } else {
          setPending([]);
        }

        // /quizzes/history のレスポンス処理（quizzesプロパティから配列を取得）
        const historyData = historyRes.data.quizzes || [];
        // 現在のユーザーの回答のみを抽出して履歴に表示
        // TODO: バックエンドから現在のユーザーIDを取得して、そのユーザーの回答のみをフィルタリング
        const historyItems: HistoryItem[] = historyData.flatMap(quiz =>
          quiz.answers.map(answer => ({
            id: `${quiz.quizId}-${answer.userId}`,
            question: quiz.questionText,
            isCorrect: answer.isCorrect,
            answeredAt: answer.answeredAt,
          }))
        );
        setHistory(historyItems);

        // /groups/stats/members のレスポンス処理（membersプロパティから配列を取得）
        const membersData = membersRes.data.members || [];
        setMembers(membersData.map(member => ({
          id: member.userId,
          name: member.displayName,
          correctRate: member.correctRate * 100, // 0-1 → 0-100 に変換（API仕様による）
        })));
      } catch (err: any) {
        // エラーハンドリング
        console.error("YangDashboard データ取得エラー:", err);

        // 401エラーの場合はログイン画面へリダイレクト
        if (err.response && err.response.status === 401) {
          setError("認証が切れました。再度ログインしてください。");
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError("データの取得に失敗しました。再読み込みしてください。");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [navigate]);

  const goToQuiz = (quiz: PendingQuiz) => {
    // /yang ページで quiz を表示・回答する想定
    navigate("/yang", { state: { nickname: undefined, quiz } });
  };

  return (
    <div className="min-h-screen bg-line-bg py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h2 className="text-xl-readable font-bold text-gray-800 text-center">子・孫ダッシュボード</h2>
        </div>

        {/* ローディング・エラー表示 */}
        {loading && (
          <div className="card text-center">
            <p className="text-base-readable text-gray-600">読み込み中...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-soft p-4 mb-6">
            <p className="text-base-readable text-red-700">{error}</p>
          </div>
        )}

        {/* 未回答のクイズセクション */}
        <section className="mb-8">
          <h3 className="text-lg-readable font-bold text-gray-800 mb-4">
            未回答のクイズ ({pending.length})
          </h3>
          {pending.length === 0 ? (
            <div className="card text-center">
              <p className="text-base-readable text-gray-600">未回答クイズはありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((q) => (
                <div key={q.quizId} className="card hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-xs-readable text-gray-500 mb-2">
                        {new Date(q.createdAt).toLocaleString('ja-JP')}
                      </div>
                      <div className="text-base-readable font-semibold text-gray-900">
                        {q.question}
                      </div>
                    </div>
                    <div className="sm:flex-shrink-0">
                      <button
                        onClick={() => goToQuiz(q)}
                        className="btn-primary w-full sm:w-auto"
                      >
                        回答する
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 回答履歴セクション */}
        <section className="mb-8">
          <h3 className="text-lg-readable font-bold text-gray-800 mb-4">回答履歴</h3>
          {history.length === 0 ? (
            <div className="card text-center">
              <p className="text-base-readable text-gray-600">履歴がありません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="card bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-base-readable font-semibold text-gray-900 mb-1">
                        {h.question}
                      </div>
                      <div className="text-xs-readable text-gray-500">
                        {new Date(h.answeredAt).toLocaleString('ja-JP')}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm-readable font-bold ${
                          h.isCorrect
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {h.isCorrect ? '正解' : '不正解'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* メンバー正答率ランキングセクション */}
        <section className="mb-8">
          <h3 className="text-lg-readable font-bold text-gray-800 mb-4">
            メンバー正答率ランキング
          </h3>
          {members.length === 0 ? (
            <div className="card text-center">
              <p className="text-base-readable text-gray-600">データがありません</p>
            </div>
          ) : (
            <div className="card">
              <ol className="space-y-3">
                {members.map((m, index) => (
                  <li key={m.id} className="flex items-center justify-between p-3 bg-line-bg rounded-soft">
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm-readable ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-orange-300 text-orange-900' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-base-readable font-semibold text-gray-800">
                        {m.name}
                      </span>
                    </div>
                    <span className="text-lg-readable font-bold text-line-green">
                      {Math.round(m.correctRate)}%
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
