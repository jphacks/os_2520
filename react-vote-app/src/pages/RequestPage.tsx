import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/axios';

// おすすめテーマ定義
const QUIZ_THEMES = [
  '学生時代の話',
  '初恋の話',
  '仕事で一番大変だったこと',
  '子供の頃の遊び',
  '昔の家族旅行',
  '子育ての話',
];

const OTHER_THEMES = [
  '次帰省したときに行きたい飲食店',
  '作ってほしい料理',
  '一緒にやりたいこと',
];

/**
 * リクエスト送信ページ
 *
 * ユーザーが10ポイントを消費してリクエストを送信できるページ
 * - クイズリクエスト: 祖父母に通知せず、クイズ作成時に反映
 * - その他リクエスト: 祖父母にLINE通知を送信
 */
const RequestPage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [requestType, setRequestType] = useState<'quiz' | 'other'>('quiz');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ポイント不足チェック
  const hasEnoughPoints = (user?.points ?? 0) >= 10;

  /**
   * おすすめテーマをクリックした時の処理
   */
  const handleThemeClick = (theme: string) => {
    setContent(theme);
  };

  /**
   * リクエスト送信処理
   */
  const handleSubmit = async () => {
    if (!hasEnoughPoints) {
      setError('ポイントが不足しています。クイズに正解してポイントを貯めましょう!');
      return;
    }

    if (!content.trim()) {
      setError('リクエスト内容を入力してください。');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post('/requests', {
        requestType,
        content: content.trim(),
      });

      // 成功したらユーザー情報を更新(ポイント残高を反映)
      await refreshUser();

      // 成功モーダルを表示
      setShowSuccessModal(true);

      // 2秒後に戻る
      setTimeout(() => {
        navigate('/yang');
      }, 2000);
    } catch (err: any) {
      console.error('リクエスト送信エラー:', err);

      if (err.response?.data?.errors) {
        setError(err.response.data.errors[0]?.message || 'エラーが発生しました');
      } else {
        setError('リクエストの送信に失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const currentThemes = requestType === 'quiz' ? QUIZ_THEMES : OTHER_THEMES;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>リクエストを送る</h2>

        {/* ポイント残高表示 */}
        <div style={styles.pointsSection}>
          <div style={styles.pointsCard}>
            <span style={styles.pointsLabel}>現在のポイント</span>
            <span style={styles.pointsValue}>{user?.points ?? 0} P</span>
          </div>
          <p style={styles.pointsNote}>
            リクエスト送信には <strong>10ポイント</strong> 必要です
          </p>
        </div>

        {/* リクエストタイプ選択 */}
        <div style={styles.section}>
          <label style={styles.label}>リクエストの種類</label>
          <div style={styles.typeButtons}>
            <button
              style={{
                ...styles.typeButton,
                ...(requestType === 'quiz' ? styles.typeButtonActive : {}),
              }}
              onClick={() => setRequestType('quiz')}
            >
              クイズリクエスト
            </button>
            <button
              style={{
                ...styles.typeButton,
                ...(requestType === 'other' ? styles.typeButtonActive : {}),
              }}
              onClick={() => setRequestType('other')}
            >
              その他リクエスト
            </button>
          </div>
          <p style={styles.typeDescription}>
            {requestType === 'quiz'
              ? 'クイズのテーマをリクエストできます。祖父母がクイズを作成する際に参考にします。'
              : '次の帰省時のリクエストなどを送信できます。祖父母にLINE通知が届きます。'}
          </p>
        </div>

        {/* おすすめテーマ */}
        <div style={styles.section}>
          <label style={styles.label}>おすすめテーマ</label>
          <div style={styles.themesGrid}>
            {currentThemes.map((theme) => (
              <button
                key={theme}
                style={styles.themeButton}
                onClick={() => handleThemeClick(theme)}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        {/* 自由入力 */}
        <div style={styles.section}>
          <label style={styles.label} htmlFor="content">
            リクエスト内容
          </label>
          <textarea
            id="content"
            style={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="リクエスト内容を入力してください..."
            rows={4}
            disabled={isLoading}
          />
          <div style={styles.charCount}>{content.length}/200</div>
        </div>

        {/* エラーメッセージ */}
        {error && <p style={styles.error}>{error}</p>}

        {/* ボタン */}
        <div style={styles.buttons}>
          <button
            style={styles.cancelButton}
            onClick={() => navigate('/yang')}
            disabled={isLoading}
          >
            キャンセル
          </button>
          <button
            style={{
              ...styles.submitButton,
              ...((!hasEnoughPoints || !content.trim() || isLoading) ? styles.submitButtonDisabled : {}),
            }}
            onClick={handleSubmit}
            disabled={!hasEnoughPoints || !content.trim() || isLoading}
          >
            {isLoading ? '送信中...' : '送信 (-10P)'}
          </button>
        </div>
      </div>

      {/* 成功モーダル */}
      {showSuccessModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalIcon}>✅</div>
            <h3 style={styles.modalTitle}>送信完了!</h3>
            <p style={styles.modalMessage}>
              リクエストを送信しました。
              <br />
              残りポイント: {user?.points ?? 0} P
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// スタイル定義
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  } as React.CSSProperties,
  card: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  } as React.CSSProperties,
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '24px',
    color: '#333',
    textAlign: 'center',
  } as React.CSSProperties,
  pointsSection: {
    marginBottom: '24px',
  } as React.CSSProperties,
  pointsCard: {
    backgroundColor: '#f0f8ff',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  } as React.CSSProperties,
  pointsLabel: {
    fontSize: '14px',
    color: '#666',
  } as React.CSSProperties,
  pointsValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#4169E1',
  } as React.CSSProperties,
  pointsNote: {
    fontSize: '12px',
    color: '#666',
    textAlign: 'center',
    margin: '0',
  } as React.CSSProperties,
  section: {
    marginBottom: '24px',
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#333',
  } as React.CSSProperties,
  typeButtons: {
    display: 'flex',
    gap: '12px',
    marginBottom: '8px',
  } as React.CSSProperties,
  typeButton: {
    flex: 1,
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    backgroundColor: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  typeButtonActive: {
    backgroundColor: '#4169E1',
    borderColor: '#4169E1',
    color: 'white',
  } as React.CSSProperties,
  typeDescription: {
    fontSize: '12px',
    color: '#666',
    margin: '0',
  } as React.CSSProperties,
  themesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '8px',
  } as React.CSSProperties,
  themeButton: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: 'white',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
  } as React.CSSProperties,
  charCount: {
    fontSize: '12px',
    color: '#999',
    textAlign: 'right',
    marginTop: '4px',
  } as React.CSSProperties,
  error: {
    color: '#dc3545',
    fontSize: '14px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#f8d7da',
    borderRadius: '6px',
    border: '1px solid #f5c6cb',
  } as React.CSSProperties,
  buttons: {
    display: 'flex',
    gap: '12px',
  } as React.CSSProperties,
  cancelButton: {
    flex: 1,
    padding: '14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#666',
  } as React.CSSProperties,
  submitButton: {
    flex: 1,
    padding: '14px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#4169E1',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  } as React.CSSProperties,
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  } as React.CSSProperties,
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    maxWidth: '400px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  } as React.CSSProperties,
  modalIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  } as React.CSSProperties,
  modalTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#333',
  } as React.CSSProperties,
  modalMessage: {
    fontSize: '16px',
    color: '#666',
    lineHeight: 1.6,
  } as React.CSSProperties,
};

export default RequestPage;
