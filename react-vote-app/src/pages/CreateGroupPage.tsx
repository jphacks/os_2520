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
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>新規グループ作成</h1>
          <p style={styles.subtitle}>家族グループの情報を入力してください</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* グループ名 */}
            <div style={styles.formGroup}>
              <label htmlFor="groupName" style={styles.label}>
                グループ名 *
              </label>
              <input
                id="groupName"
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="例: 山田家、祖父と孫たち"
                maxLength={30}
                style={styles.input}
                disabled={loading}
              />
              <p style={styles.hint}>最大30文字</p>
            </div>

            {/* パスワード */}
            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>
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
                style={styles.input}
                disabled={loading}
              />
              <p style={styles.hint}>最低8文字、最長36文字</p>
            </div>

            {/* クイズ出題頻度 */}
            <div style={styles.formGroup}>
              <label htmlFor="alertFrequency" style={styles.label}>
                クイズ出題頻度 *
              </label>
              <select
                id="alertFrequency"
                value={alertFrequencyDays}
                onChange={(e) => setAlertFrequencyDays(Number(e.target.value))}
                style={styles.select}
                disabled={loading}
              >
                <option value={1}>1日</option>
                <option value={1.5}>1.5日</option>
                <option value={2} selected>
                  2日
                </option>
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
              <p style={styles.hint}>
                祖父母がこの期間クイズを出さない場合、家族にアラートが通知されます
              </p>
            </div>

            {/* エラーメッセージ */}
            {error && <p style={styles.errorText}>{error}</p>}

            {/* ボタングループ */}
            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => navigate("/group-setup")}
                disabled={loading}
                style={styles.backButton}
              >
                戻る
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitButton,
                  ...(loading ? styles.submitButtonDisabled : {}),
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = "#28a745";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = "#34c759";
                  }
                }}
              >
                {loading ? "作成中..." : "グループを作成"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* グループID表示モーダル */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>グループを作成しました！</h2>
            <p style={styles.modalText}>
              以下のグループIDを家族に共有してください。
              <br />
              家族はこのIDとパスワードでグループに参加できます。
            </p>
            <div style={styles.groupIdBox}>
              <div style={styles.groupIdLabel}>招待用グループID</div>
              <div style={styles.groupIdValue}>{createdGroupId}</div>
            </div>
            <button
              onClick={handleCopyGroupId}
              style={styles.copyButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#0056b3";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#007bff";
              }}
            >
              📋 IDをコピー
            </button>
            <button
              onClick={handleModalClose}
              style={styles.modalCloseButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#28a745";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#34c759";
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// スタイル定義
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: "20px",
  } as React.CSSProperties,
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "40px",
    maxWidth: "500px",
    width: "100%",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  } as React.CSSProperties,
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "8px",
    textAlign: "center",
  } as React.CSSProperties,
  subtitle: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "32px",
    textAlign: "center",
  } as React.CSSProperties,
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  } as React.CSSProperties,
  formGroup: {
    display: "flex",
    flexDirection: "column",
  } as React.CSSProperties,
  label: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "8px",
  } as React.CSSProperties,
  input: {
    padding: "12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    outline: "none",
    transition: "border-color 0.2s",
  } as React.CSSProperties,
  select: {
    padding: "12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    outline: "none",
    backgroundColor: "white",
    cursor: "pointer",
  } as React.CSSProperties,
  hint: {
    fontSize: "12px",
    color: "#999",
    margin: "4px 0 0 0",
  } as React.CSSProperties,
  errorText: {
    fontSize: "14px",
    color: "#d32f2f",
    margin: "0",
    padding: "8px",
    backgroundColor: "#ffebee",
    borderRadius: "4px",
  } as React.CSSProperties,
  buttonGroup: {
    display: "flex",
    gap: "12px",
  } as React.CSSProperties,
  backButton: {
    flex: 1,
    padding: "14px",
    backgroundColor: "white",
    color: "#666",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.2s",
  } as React.CSSProperties,
  submitButton: {
    flex: 2,
    padding: "14px",
    backgroundColor: "#34c759",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.2s",
  } as React.CSSProperties,
  submitButtonDisabled: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  } as React.CSSProperties,
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  } as React.CSSProperties,
  modalContent: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "32px",
    maxWidth: "400px",
    width: "90%",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
  } as React.CSSProperties,
  modalTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "16px",
    textAlign: "center",
  } as React.CSSProperties,
  modalText: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "24px",
    lineHeight: "1.6",
    textAlign: "center",
  } as React.CSSProperties,
  groupIdBox: {
    backgroundColor: "#f8f9fa",
    border: "2px solid #007bff",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "16px",
  } as React.CSSProperties,
  groupIdLabel: {
    fontSize: "12px",
    color: "#666",
    marginBottom: "8px",
    textAlign: "center",
  } as React.CSSProperties,
  groupIdValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#007bff",
    textAlign: "center",
    letterSpacing: "2px",
    fontFamily: "monospace",
  } as React.CSSProperties,
  copyButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "12px",
    transition: "background-color 0.2s",
  } as React.CSSProperties,
  modalCloseButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#34c759",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.2s",
  } as React.CSSProperties,
};

export default CreateGroupPage;
