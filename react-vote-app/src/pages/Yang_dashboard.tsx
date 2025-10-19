import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "https://api.example.com"; // 実環境のURLに置き換えてください

interface PendingQuiz {
  id: string;
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
    const token = localStorage.getItem("jwt") ?? "";
    const headers = { Authorization: `Bearer ${token}` };

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [pendingRes, historyRes, membersRes] = await Promise.all([
          axios.get<PendingQuiz[]>(`${API_BASE_URL}/quizzes/pending`, { headers }),
          axios.get<HistoryItem[]>(`${API_BASE_URL}/quizzes/history`, { headers }),
          axios.get<MemberStat[]>(`${API_BASE_URL}/groups/stats/members`, { headers }),
        ]);

        setPending(pendingRes.data ?? []);
        setHistory(historyRes.data ?? []);
        setMembers(membersRes.data ?? []);
      } catch (err) {
        // catch のエラーは unknown として受け取り、安全に Error に変換する
        const e: Error = err instanceof Error ? err : new Error(String(err));
        console.error("YangDashboard fetch error:", e);
        setError("データの取得に失敗しました。再読み込みしてください。");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

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
              <li key={q.id} style={{ borderBottom: "1px solid #eee", padding: "10px 0" }}>
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