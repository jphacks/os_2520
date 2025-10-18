// ...existing code...
import { useLocation, useNavigate } from "react-router-dom";
import React, { useState } from "react";

function HappyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const nickname = (location.state as { nickname: string })?.nickname;

  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);

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
    const response = await fetch('http://localhost:3000/quizzes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nickname,
        question,
        choices,
        correctIndex,
      })
    });

    if (!response.ok) {
      throw new Error('送信に失敗しました');
    }

    const data = await response.json();
    console.log('送信成功:', data);
    alert("送信完了！");
    navigate("/");
  } catch (error) {
    console.error('エラー:', error);
    alert("送信中にエラーが発生しました。");
  }
};

// ...existing code...
  return (
    <div style={{ padding: 16 }}>
      <h2>
        {nickname}さん
        <p>質問を作成して送信してください</p>
      </h2>

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
        <label>選択肢（4つ） ※各最大20文字</label>
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
          </div>
        ))}
        <br />
      </div>
      <p>正解を選んで下さい</p>
      {choices.map((c, i) => (
       <div key={i} style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <input
                type="radio"
                name="correct"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
                disabled={c.trim() === ""}
                />
                {` ${i + 1}`}
      </div> ))}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => navigate("/")}>戻る</button>
        <button onClick={handleSend}>出題</button>
      </div>
    </div>
  );
}

export default HappyPage;
// ...existing code...