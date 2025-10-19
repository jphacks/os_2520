import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://api.example.com"; // 実際のAPIに置き換えてください

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
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/quizzes/history`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwt") ?? ""}`,
          },
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || `status ${res.status}`);
        }
        const data = await res.json();
        // API側が配列を返す前提。必要なら変換処理を追加してください。
        setQuizzes(data as QuizSummary[]);
      } catch (e) {
        console.error("fetchHistory error:", e);
        setError("履歴の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const sendEmergency = async () => {
    if (!confirm("本当に家族全員に緊急通知を送りますか？")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/alerts/emergency`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwt") ?? ""}`,
        },
        body: JSON.stringify({ message: "緊急通知: 既定のメッセージ" }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `status ${res.status}`);
      }
      alert("緊急通知を送信しました。");
    } catch (e) {
      console.error("sendEmergency error:", e);
      alert("緊急通知の送信に失敗しました。");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>祖父母ダッシュボード</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => navigate("/")} style={{ marginRight: 8 }}>
          ホームへ
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