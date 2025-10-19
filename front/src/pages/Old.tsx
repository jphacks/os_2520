// ...existing code...
import { useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import apiClient from "../lib/axios";

// 型定義
interface PendingRequest {
  requestId: string;
  content: string;
  requesterName: string;
  createdAt: string;
}

interface QuizCreateRequest {
  questionText: string;
  options: {
    optionText: string;
    isCorrect: boolean;
  }[];
}

interface QuizCreateResponse {
  quizId: string;
  message: string;
}

function OldPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const nickname = (location.state as { nickname: string })?.nickname;

  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(null);

  // 未対応のクイズリクエストを取得
  useEffect(() => {
    const fetchPendingRequest = async () => {
      try {
        const response = await apiClient.get('/requests/pending');
        if (response.data.requests && response.data.requests.length > 0) {
          setPendingRequest(response.data.requests[0]);
        }
      } catch (error) {
        console.error('リクエスト取得エラー:', error);
      }
    };
    fetchPendingRequest();
  }, []);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value.slice(0, 100));
  };

  const handleChoiceChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const v = e.target.value.slice(0, 20);
    const next = [...choices];
    next[index] = v;
    setChoices(next);
    // 入力を消した場合、もしその選択肢が正解に設定されていたら正解をクリアする
    if (v.trim() === "" && correctIndex === index) {
      setCorrectIndex(null);
    }
  };

  // ...existing code...

const handleSend = async (): Promise<void> => {
  if (!question.trim()) {
    alert("質問を入力してください。");
    return;
  }
  const filled = choices.filter((c) => c.trim() !== "");
  if (filled.length < 4) {
    alert("選択肢４つ全て入力をしてください");
    return;
  }
  if (correctIndex === null) {
    alert("正解の選択をしてください。");
    return;
  }

  try {
    // API設計書に準拠したリクエストボディの作成
    const requestBody: QuizCreateRequest = {
      questionText: question.trim(),
      options: choices.map((choice, index) => ({
        optionText: choice.trim(),
        isCorrect: index === correctIndex
      }))
    };

    // apiClientを使用してクイズ作成APIを呼び出し（httpOnly Cookie使用）
    const response = await apiClient.post<QuizCreateResponse>('/quizzes', requestBody);

    console.log('クイズ作成成功:', response.data);
    alert("クイズを出題しました！");
    // 作成成功後は祖父母ダッシュボードへ遷移
    navigate("/old/dashboard");
  } catch (error) {
    console.error('クイズ作成エラー:', error);
    alert("クイズの出題に失敗しました。もう一度お試しください。");
  }
};

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


// ...existing code...
  return (
    <div style={{ padding: 16 }}>
      <h2>
        {nickname}さん
        <p>質問を作成して送信してください</p>
      </h2>

      {/* 未対応リクエスト表示 */}
      {pendingRequest && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#856404' }}>
            クイズリクエストが届いています!
          </div>
          <p style={{ margin: '8px 0', color: '#856404' }}>
            {pendingRequest.requesterName}さんから
            「<strong>{pendingRequest.content}</strong>」
            のリクエストが届きました
          </p>
          <p style={{ fontSize: '12px', color: '#856404', margin: '0' }}>
            このテーマでクイズを作成すると、自動的にリクエストに対応します
          </p>
        </div>
      )}


      <div style={{ marginBottom: 12 }}>
        <label>質問（最大100文字）</label>
        <br />
        <textarea
          placeholder="ここに質問を入力してください"
          style={{ width: "100%", minHeight: 80, padding: 8 }}
          value={question}
          onChange={handleQuestionChange}
          maxLength={100}
        />
        <div style={{ textAlign: "right" }}>{question.length}/100</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{whiteSpace: "pre"}}>選択肢（4つ）  ※各最大20文字                                    答え</label>

        <br />
        {choices.map((c, i) => (
          <div key={i} style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="text"
              placeholder={`選択肢 ${i + 1}`}
              value={c}
              onChange={(e) => handleChoiceChange(i, e)}
              maxLength={50}
              style={{ width: "65%", padding: 6 }}
            />
            <small style={{ width: 60, textAlign: "left" }}>{c.length}/20</small>
            <input
                type="radio"
                name="correct"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
                disabled={c.trim() === ""}
                />
                {` ${i + 1}`}
          </div>
        ))}
        <br />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => navigate("/")}>戻る</button>
        <button onClick={() => navigate("/old/dashboard")}>ダッシュボードへ</button>
        <button onClick={handleSend}>出題</button>
        <button onClick={sendEmergency} style={{ background: "#e53935", color: "#fff" }}>
          緊急通知を送る
        </button>
      </div>
    </div>
  );
}

export default OldPage;
// ...existing code...