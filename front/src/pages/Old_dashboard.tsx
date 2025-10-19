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
    <div style={{ padding: 16 }}>
      <h2>祖父母ダッシュボード</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => navigate("/old")} style={{ marginRight: 8 }}>
          クイズを作成する
        </button>
        <button onClick={sendEmergency} style={{ background: "#e53935", color: "#fff" }}>
          緊急通知を送る
        </button>
      </div>

      <section>
        <h3>過去の出題一覧</h3>
        {loading && <p>読み込み中...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && quizzes.length === 0 && <p>過去の出題はありません</p>}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {quizzes.map((q) => (
            <li key={q.id} style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: "#666" }}>{new Date(q.createdAt).toLocaleString()}</div>
                  <div style={{ fontWeight: 600, marginTop: 6 }}>{q.question}</div>
                  <div style={{ marginTop: 6, fontSize: 13, color: "#444" }}>
                    正答率: {Math.round(q.correctRate)}% ・ 回答者 {q.answeredCount}/{q.totalCount}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button onClick={() => navigate(`/quiz/${q.id}`, { state: { quizId: q.id } })}>
                    詳細
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default OldDashboard;
