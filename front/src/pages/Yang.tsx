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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="card text-center max-w-md">
          <p className="text-base-readable mb-4">クイズは出題されていません</p>
          <button onClick={() => navigate("/")} className="btn-primary w-full">
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-line-bg py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          {/* ヘッダー */}
          <div className="text-center mb-6">
            <h2 className="text-xl-readable font-bold text-gray-800">{nickname}さん</h2>
          </div>

          {/* ポイント表示 */}
          <div className="bg-line-green-50 rounded-soft p-4 mb-6 text-center border-2 border-line-green-200">
            <span className="text-sm-readable text-gray-600 block mb-1">あなたのポイント</span>
            <span className="text-4xl font-bold text-line-green">{user?.points ?? 0} P</span>
          </div>

          {/* リクエストボタン */}
          {(user?.points ?? 0) >= 10 && (
            <button
              onClick={() => navigate('/request')}
              className="btn-primary w-full mb-6"
            >
              リクエストする (10P)
            </button>
          )}

          <h3 className="text-lg-readable font-bold text-center mb-6 text-gray-700">質問に答えてね</h3>

          {/* クイズ本文 */}
          <div className="bg-line-green-50 rounded-soft p-5 mb-6 border-l-4 border-line-green">
            <h4 className="text-base-readable font-semibold text-gray-700 mb-2">クイズ本文</h4>
            <p className="text-base-readable font-bold text-gray-900">{quiz.question}</p>
          </div>

          {/* 選択肢 (ラジオボタン) */}
          <div className="mb-6">
            <h4 className="text-base-readable font-semibold text-gray-700 mb-3">選択肢</h4>
            <div className="space-y-3">
              {quiz.choices.map((choice) => (
                <div key={choice.id} className="bg-white border-2 border-gray-200 rounded-soft p-4 hover:border-line-green transition-colors">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="quiz-answer"
                      value={choice.id}
                      checked={selectedOptionId === choice.id}
                      onChange={() => setSelectedOptionId(choice.id)}
                      className="w-5 h-5 text-line-green focus:ring-line-green focus:ring-2 mr-3"
                      disabled={isLoading}
                    />
                    <span className="text-base-readable text-gray-800">{choice.text}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* メッセージ (任意) */}
          <div className="mb-6">
            <label htmlFor="message" className="block text-base-readable font-semibold text-gray-700 mb-2">
              メッセージ (任意)
            </label>
            <textarea
              id="message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="面白いクイズだね！"
              className="textarea-field"
              disabled={isLoading}
            />
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-soft p-4 mb-4">
              <p className="text-base-readable text-red-700">{error}</p>
            </div>
          )}

          {/* 回答結果メッセージ */}
          {response && (
            <div className={`rounded-soft p-4 mb-4 border-2 ${response.isCorrect ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
              <p className={`text-base-readable font-bold ${response.isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
                回答済み: {response.isCorrect ? "正解！" : "残念！不正解です"}
              </p>
            </div>
          )}

          {/* 回答ボタン */}
          <button
            onClick={handleAnswerSubmit}
            disabled={isLoading || !selectedOptionId}
            className="btn-primary w-full mb-3"
          >
            {isLoading ? "回答中..." : "回答"}
          </button>

          {/* ナビゲーションボタン */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/")}
              disabled={isLoading}
              className="btn-secondary"
            >
              戻る
            </button>
            <button
              onClick={() => navigate("/yang/dashboard")}
              disabled={isLoading}
              className="btn-secondary"
            >
              ダッシュボードへ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default YangPage;