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
    <div className="min-h-screen bg-line-bg p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            {nickname}さん
          </h2>
          <p className="text-lg sm:text-xl text-gray-600">
            質問を作成して送信してください
          </p>
        </div>

        {/* 未対応リクエスト表示 */}
        {pendingRequest && (
          <div className="card bg-yellow-50 border-2 border-yellow-400 mb-6">
            <div className="text-xl sm:text-2xl font-bold mb-3 text-yellow-800">
              クイズリクエストが届いています!
            </div>
            <p className="text-base sm:text-lg text-yellow-800 mb-2">
              {pendingRequest.requesterName}さんから
              「<strong>{pendingRequest.content}</strong>」
              のリクエストが届きました
            </p>
            <p className="text-sm sm:text-base text-yellow-700">
              このテーマでクイズを作成すると、自動的にリクエストに対応します
            </p>
          </div>
        )}

        {/* 質問入力 */}
        <div className="card mb-6">
          <label className="block text-xl sm:text-2xl font-bold text-gray-800 mb-3">
            質問（最大100文字）
          </label>
          <textarea
            placeholder="ここに質問を入力してください"
            className="textarea-field min-h-[120px] text-lg sm:text-xl"
            value={question}
            onChange={handleQuestionChange}
            maxLength={100}
          />
          <div className="text-right text-base sm:text-lg text-gray-600 mt-2">
            {question.length}/100
          </div>
        </div>

        {/* 選択肢入力 */}
        <div className="card mb-6">
          <label className="block text-xl sm:text-2xl font-bold text-gray-800 mb-3">
            選択肢（4つ） ※各最大20文字
          </label>
          <div className="space-y-4">
            {choices.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={`選択肢 ${i + 1}`}
                    value={c}
                    onChange={(e) => handleChoiceChange(i, e)}
                    maxLength={20}
                    className="input-field text-lg sm:text-xl"
                  />
                  <div className="text-sm sm:text-base text-gray-600 mt-1 text-right">
                    {c.length}/20
                  </div>
                </div>
                <div className="flex items-center gap-2 min-w-[80px]">
                  <input
                    type="radio"
                    name="correct"
                    checked={correctIndex === i}
                    onChange={() => setCorrectIndex(i)}
                    disabled={c.trim() === ""}
                    className="w-6 h-6 cursor-pointer disabled:cursor-not-allowed"
                    id={`correct-${i}`}
                  />
                  <label
                    htmlFor={`correct-${i}`}
                    className="text-lg sm:text-xl font-bold text-gray-700 cursor-pointer"
                  >
                    答え
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ボタングループ */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => navigate("/")}
            className="btn-secondary text-lg sm:text-xl py-4"
          >
            戻る
          </button>
          <button
            onClick={() => navigate("/old/dashboard")}
            className="btn-secondary text-lg sm:text-xl py-4"
          >
            ダッシュボードへ
          </button>
          <button
            onClick={handleSend}
            className="btn-primary text-xl sm:text-2xl py-5 font-extrabold shadow-lg"
          >
            📝 出題する
          </button>
          <button
            onClick={sendEmergency}
            className="btn-danger text-lg sm:text-xl py-4"
          >
            🚨 緊急通知を送る
          </button>
        </div>
      </div>
    </div>
  );
}

export default OldPage;
// ...existing code...