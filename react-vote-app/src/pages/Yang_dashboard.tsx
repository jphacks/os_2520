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
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h2>子・孫ダッシュボード</h2>
      {loading && <p>読み込み中...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <section style={{ marginTop: 12 }}>
        <h3>未回答のクイズ ({pending.length})</h3>
        {pending.length === 0 ? (
          <p>未回答クイズはありません</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {pending.map((q) => (
              <li key={q.quizId} style={{ borderBottom: "1px solid #eee", padding: "10px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#666" }}>{new Date(q.createdAt).toLocaleString()}</div>
                    <div style={{ fontWeight: 600, marginTop: 6 }}>{q.question}</div>
                  </div>
                  <div>
                    <button onClick={() => goToQuiz(q)}>回答する</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>回答履歴</h3>
        {history.length === 0 ? (
          <p>履歴がありません</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {history.map((h) => (
              <li key={h.id} style={{ borderBottom: "1px solid #f0f0f0", padding: "8px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{h.question}</div>
                    <div style={{ fontSize: 13, color: "#666" }}>{new Date(h.answeredAt).toLocaleString()}</div>
                  </div>
                  <div style={{ alignSelf: "center", color: h.isCorrect ? "green" : "orange" }}>
                    {h.isCorrect ? "正解" : "不正解"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>メンバー正答率ランキング</h3>
        {members.length === 0 ? (
          <p>データがありません</p>
        ) : (
          <ol>
            {members.map((m) => (
              <li key={m.id} style={{ marginBottom: 6 }}>
                {m.name} — 正答率: {Math.round(m.correctRate)}%
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
