import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../lib/axios";
import { useAuth } from "../contexts/AuthContext";

// useLocationのstateに格納されると想定するクイズデータの型
// (表示・回答に必要な最低限の情報を定義)
interface QuizData {
  quizId: string;
  question: string;
  choices: {
    id: string; // "clx..." のような選択肢ID
    text: string;
  }[];
}
interface QuizResponse {
  isCorrect: boolean;
  correctOptionId: string;
}

// useLocationのstateの型定義
interface LocationState {
  nickname?: string;
  quiz?: QuizData; // 画面表示のためのクイズデータ
}

function YangPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // 1. location.stateからデータ取得
  const state = location.state as LocationState;
  const nickname = state?.nickname ?? "回答者";
  const quiz = state?.quiz;

  // 2. フォームの状態管理
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<QuizResponse | null>(null); // APIの成功レスポンスを保持

  // 3. API設計に基づく回答送信処理
  const handleAnswerSubmit = async (): Promise<void> => {
    // クイズデータと選択肢が選択されているかを確認
    if (!quiz || !selectedOptionId) {
      alert("クイズ情報が見つからないか、選択肢が選ばれていません。");
      return;
    }

    // Path Paramsから quizId を取得
    const { quizId } = quiz;

    // Request Body の構成（messageは任意のため、空の場合は含めない）
    const requestBody = {
      selectedOptionId: selectedOptionId,
      ...(message.trim() && { message: message.trim() })
    };

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      // apiClientを使用してクイズ回答APIを呼び出し（httpOnly Cookie使用）
      const result = await apiClient.post<QuizResponse>(`/quizzes/${quizId}/answer`, requestBody);

      // Success Response (200 OK) の処理
      // Response: {"isCorrect": true, "correctOptionId": "clx..."}
      setResponse(result.data);
      alert(`回答が送信されました！\n正解: ${result.data.isCorrect ? '⭕' : '❌'}`);
      // 回答送信後にダッシュボードへ遷移
      navigate("/yang/dashboard");

    } catch (err: any) {
      // Error Response の処理 (400, 401, 404, 409, 500など)
      if (err.response) {
        const status = err.response.status;
        let errorMessage = `APIエラー: ステータス${status}`;

        // 特に重要なエラーコードの処理
        if (status === 401) {
          errorMessage = "認証が必要です (Unauthorized)。ログインし直してください。";
        } else if (status === 404) {
          errorMessage = "クイズまたは選択肢が見つかりません (Not Found)。";
        } else if (status === 409) {
          errorMessage = "既に回答済みです (Conflict)。";
        }
        setError(errorMessage);
        console.error("クイズ回答エラー:", err.response.data);
      } else {
        setError("ネットワークエラーまたは予期せぬエラーが発生しました。");
        console.error("Unknown Error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!quiz) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <p>クイズは出題されていません</p>
        <button onClick={() => navigate("/")} style={{ marginTop: "20px" }}>
          戻る
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px", maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>{nickname}さん</h2>

      {/* ポイント表示 */}
      <div style={{ backgroundColor: "#f0f8ff", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
        <span style={{ fontSize: "14px", color: "#666" }}>あなたのポイント: </span>
        <span style={{ fontSize: "24px", fontWeight: "bold", color: "#4169E1" }}>{user?.points ?? 0} P</span>
      </div>

      {/* リクエストボタン */}
      {(user?.points ?? 0) >= 10 && (
        <button
          onClick={() => navigate('/request')}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#32CD32",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            marginBottom: "16px"
          }}
        >
          リクエストする (10P)
        </button>
      )}

      <h3>質問に答えてね</h3>

      <div style={{ textAlign: "left", marginBottom: "20px", padding: "15px", border: "1px solid #eee", borderRadius: "5px" }}>
        <h4>クイズ本文</h4>
        <p style={{ fontWeight: "bold" }}>{quiz.question}</p>
      </div>

      {/* 選択肢 (ラジオボタン) */}
      <div style={{ textAlign: "left", marginBottom: "20px" }}>
        <h4 style={{ marginBottom: "10px" }}>選択肢</h4>
        {quiz.choices.map((choice) => (
          <div key={choice.id} style={{ marginBottom: "8px" }}>
            <label>
              <input
                type="radio"
                name="quiz-answer"
                value={choice.id}
                checked={selectedOptionId === choice.id}
                onChange={() => setSelectedOptionId(choice.id)}
                style={{ marginRight: "8px" }}
                disabled={isLoading}
              />
              {choice.text}
            </label>
          </div>
        ))}
      </div>

      {/* メッセージ (任意) */}
      <div style={{ textAlign: "left", marginBottom: "20px" }}>
        <label htmlFor="message" style={{ display: "block", marginBottom: "5px" }}>
          メッセージ (任意)
        </label>
        <textarea
          id="message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="面白いクイズだね！"
          style={{ width: "100%", padding: "8px", border: "1px solid #ccc" }}
          disabled={isLoading}
        />
      </div>

      {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
      {response && (
        <p style={{ color: response.isCorrect ? "green" : "orange", marginBottom: "10px", fontWeight: "bold" }}>
          回答済み: {response.isCorrect ? "正解！" : "残念！不正解です"}
        </p>
      )}

      {/* 回答ボタン */}
      <button
        onClick={handleAnswerSubmit}
        disabled={isLoading || !selectedOptionId}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: isLoading || !selectedOptionId ? "#cccccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: isLoading || !selectedOptionId ? "not-allowed" : "pointer",
          fontWeight: "bold",
          marginBottom: "10px"
        }}
      >
        {isLoading ? "回答中..." : "回答"}
      </button>

      <button onClick={() => navigate("/")} disabled={isLoading} style={{ width: "100%", padding: "8px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
        戻る
      </button>
      {/* 追加: ダッシュボードへ直接移動するボタン */}
      <button onClick={() => navigate("/yang/dashboard")} disabled={isLoading} style={{ width: "100%", padding: "8px", marginTop: 8 }}>
        ダッシュボードへ
      </button>
    </div>
  );
}

export default YangPage;