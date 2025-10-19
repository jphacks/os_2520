import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../lib/axios";

/**
 * 新規グループ作成画面
 *
 * フロントエンド設計書に基づき、以下の項目を入力します:
 * - グループ名（最大30文字）
 * - パスワード（最低8文字、最長36文字）
 * - クイズ出題頻度（1~7日間、0.5刻み）
 *
 * グループ作成後、招待用グループIDをモーダルで表示します。
 */
const CreateGroupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [password, setPassword] = useState("");
  const [alertFrequencyDays, setAlertFrequencyDays] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [createdGroupId, setCreatedGroupId] = useState<string>("");

  /**
   * 「グループを作成」ボタンクリック時の処理
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // バリデーション
    if (!groupName.trim()) {
      setError("グループ名を入力してください");
      return;
    }
    if (groupName.trim().length > 30) {
      setError("グループ名は30文字以内で入力してください");
      return;
    }
    if (!password) {
      setError("パスワードを入力してください");
      return;
    }
    if (password.length < 8 || password.length > 36) {
      setError("パスワードは8文字以上、36文字以内で入力してください");
      return;
    }

    setLoading(true);

    try {
      // POST /groups を呼び出してグループを作成
      const response = await apiClient.post("/groups", {
        groupName: groupName.trim(),
        password: password,
        alertFrequencyDays: alertFrequencyDays,
      });

      // 作成されたグループIDを保存してモーダルを表示
      setCreatedGroupId(response.data.groupId);
      setShowModal(true);
    } catch (err: any) {
      console.error("グループ作成エラー:", err);
      if (err.response?.data?.errors) {
        // バリデーションエラーの場合
        const errors = err.response.data.errors;
        setError(errors.map((e: any) => e.message).join(", "));
      } else {
        setError(err.response?.data?.error || "グループの作成に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * グループIDをクリップボードにコピー
   */
  const handleCopyGroupId = async () => {
    try {
      await navigator.clipboard.writeText(createdGroupId);
      alert("グループIDをコピーしました！");
    } catch (err) {
      console.error("コピーエラー:", err);
      alert("コピーに失敗しました");
    }
  };

  /**
   * モーダルのOKボタンクリック時の処理
   * 役割に応じたダッシュボードへ遷移
   */
  const handleModalClose = () => {
    setShowModal(false);
    // 役割に応じてダッシュボードへ遷移
    if (user?.role === "grandparent") {
      navigate("/old/dashboard"); // 祖父母ダッシュボード
    } else {
      navigate("/yang/dashboard"); // 子・孫ダッシュボード
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-line-bg px-4 py-8">
        <div className="card max-w-2xl w-full">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">
            新規グループ作成
          </h1>
          <p className="text-sm md:text-base text-gray-600 mb-8 text-center">
            家族グループの情報を入力してください
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* グループ名 */}
            <div className="flex flex-col">
              <label
                htmlFor="groupName"
                className="text-sm-readable font-bold text-gray-800 mb-2"
              >
                グループ名 *
              </label>
              <input
                id="groupName"
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="例: 山田家、祖父と孫たち"
                maxLength={30}
                className="input-field"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">最大30文字</p>
            </div>

            {/* パスワード */}
            <div className="flex flex-col">
              <label
                htmlFor="password"
                className="text-sm-readable font-bold text-gray-800 mb-2"
              >
                パスワード *
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8文字以上のパスワード"
                minLength={8}
                maxLength={36}
                className="input-field"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                最低8文字、最長36文字
              </p>
            </div>

            {/* クイズ出題頻度 */}
            <div className="flex flex-col">
              <label
                htmlFor="alertFrequency"
                className="text-sm-readable font-bold text-gray-800 mb-2"
              >
                クイズ出題頻度 *
              </label>
              <select
                id="alertFrequency"
                value={alertFrequencyDays}
                onChange={(e) => setAlertFrequencyDays(Number(e.target.value))}
                className="input-field cursor-pointer"
                disabled={loading}
              >
                <option value={1}>1日</option>
                <option value={1.5}>1.5日</option>
                <option value={2}>2日</option>
                <option value={2.5}>2.5日</option>
                <option value={3}>3日</option>
                <option value={3.5}>3.5日</option>
                <option value={4}>4日</option>
                <option value={4.5}>4.5日</option>
                <option value={5}>5日</option>
                <option value={5.5}>5.5日</option>
                <option value={6}>6日</option>
                <option value={6.5}>6.5日</option>
                <option value={7}>7日</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                祖父母がこの期間クイズを出さない場合、家族にアラートが通知されます
              </p>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <p className="text-sm-readable text-red-700 bg-red-50 p-3 rounded-soft border border-red-200">
                {error}
              </p>
            )}

            {/* ボタングループ */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/group-setup")}
                disabled={loading}
                className="flex-1 btn-secondary"
              >
                戻る
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] btn-primary"
              >
                {loading ? "作成中..." : "グループを作成"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* グループID表示モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-soft p-8 max-w-md w-full shadow-lg">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 text-center">
              グループを作成しました！
            </h2>
            <p className="text-sm-readable text-gray-600 mb-6 text-center leading-relaxed">
              以下のグループIDを家族に共有してください。
              <br />
              家族はこのIDとパスワードでグループに参加できます。
            </p>
            <div className="bg-line-green-50 border-2 border-line-green rounded-soft p-4 mb-4">
              <div className="text-xs text-gray-600 mb-2 text-center">
                招待用グループID
              </div>
              <div className="text-2xl md:text-3xl font-bold text-line-green text-center tracking-wider font-mono">
                {createdGroupId}
              </div>
            </div>
            <button
              onClick={handleCopyGroupId}
              className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-3 px-6 rounded-soft transition-colors duration-200 text-base-readable mb-3"
            >
              📋 IDをコピー
            </button>
            <button onClick={handleModalClose} className="w-full btn-primary">
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateGroupPage;
