// ...existing code...
import { useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import apiClient from "../lib/axios";

function OldPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const nickname = (location.state as { nickname: string })?.nickname;

  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [pendingRequest, setPendingRequest] = useState<any | null>(null);

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

const handleSend = async () => {
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
    // APIエンドポイントの指定
    const API_BASE_URL = "https://api.example.com"; // 実際のAPIのURLに変更してください
    
    // APIリクエストの作成
    const response = await fetch(`${API_BASE_URL}/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt')}` // JWTトークンの追加
      },
      body: JSON.stringify({
        question: question.trim(),
        choices: choices.map(choice => ({
          text: choice.trim(),
          isCorrect: choices.indexOf(choice) === correctIndex
        })),
        theme: null, // オプショナル：テーマ機能を実装する場合に使用
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '送信に失敗しました');
    }

    const data = await response.json();
    console.log('クイズ作成成功:', data);
    alert("クイズを出題しました！");
    // 変更：作成成功後は祖父母ダッシュボードへ遷移
    navigate("/old/dashboard");
  } catch (error) {
    console.error('エラー:', error);
    alert("エラーが発生しました。");
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
        <label style={{whiteSpace: "pre"}}>選択肢（4つ） ※各最大20文字           正解</label>
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
        <button>緊急通知</button>
      </div>
    </div>
  );
}

export default OldPage;
// ...existing code...