import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/axios';

/**
 * ユーザー情報入力画面
 *
 * フロントエンド設計書に基づき、初回ユーザーが自身の役割と表示名を設定します。
 * - 役割選択: 祖父母 / 子・孫
 * - 氏名入力: 最大20文字
 */
const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'grandparent' | 'family'>('family');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 「次へ」ボタンクリック時の処理
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // バリデーション
    if (!displayName.trim()) {
      setError('氏名を入力してください');
      return;
    }
    if (displayName.trim().length > 20) {
      setError('氏名は20文字以内で入力してください');
      return;
    }

    setLoading(true);

    try {
      // PUT /users/me/profile を呼び出してプロフィールを更新
      await apiClient.put('/users/me/profile', {
        displayName: displayName.trim(),
        role: role,
      });

      // 認証状態を更新
      await refreshUser();

      // グループ選択/作成画面へ遷移
      navigate('/group-setup');
    } catch (err: any) {
      console.error('プロフィール更新エラー:', err);
      setError(
        err.response?.data?.error || 'プロフィールの更新に失敗しました'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>ユーザー情報入力</h1>
        <p style={styles.subtitle}>
          あなたの役割と氏名を入力してください
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* 役割選択 */}
          <div style={styles.formGroup}>
            <label style={styles.label}>役割を選択 *</label>
            <div style={styles.radioGroup}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="role"
                  value="grandparent"
                  checked={role === 'grandparent'}
                  onChange={(e) => setRole(e.target.value as 'grandparent' | 'family')}
                  style={styles.radio}
                />
                <span style={styles.radioText}>祖父母</span>
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="role"
                  value="family"
                  checked={role === 'family'}
                  onChange={(e) => setRole(e.target.value as 'grandparent' | 'family')}
                  style={styles.radio}
                />
                <span style={styles.radioText}>子・孫</span>
              </label>
            </div>
            <p style={styles.hint}>
              {role === 'grandparent'
                ? 'クイズを出題する側として登録します'
                : 'クイズに回答する側として登録します'}
            </p>
          </div>

          {/* 氏名入力 */}
          <div style={styles.formGroup}>
            <label htmlFor="displayName" style={styles.label}>
              氏名（アプリ内表示名） *
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="例: 山田太郎"
              maxLength={20}
              style={styles.input}
              disabled={loading}
            />
            <p style={styles.hint}>最大20文字</p>
          </div>

          {/* エラーメッセージ */}
          {error && <p style={styles.errorText}>{error}</p>}

          {/* 次へボタン */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              ...(loading ? styles.submitButtonDisabled : {}),
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#0056b3';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#007bff';
              }
            }}
          >
            {loading ? '登録中...' : '次へ'}
          </button>
        </form>
      </div>
    </div>
  );
};

// スタイル定義
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  } as React.CSSProperties,
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  } as React.CSSProperties,
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
    textAlign: 'center',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '32px',
    textAlign: 'center',
  } as React.CSSProperties,
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  } as React.CSSProperties,
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  } as React.CSSProperties,
  radioGroup: {
    display: 'flex',
    gap: '16px',
    marginBottom: '8px',
  } as React.CSSProperties,
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  } as React.CSSProperties,
  radio: {
    marginRight: '6px',
    cursor: 'pointer',
  } as React.CSSProperties,
  radioText: {
    fontSize: '14px',
    color: '#333',
  } as React.CSSProperties,
  input: {
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.2s',
  } as React.CSSProperties,
  hint: {
    fontSize: '12px',
    color: '#999',
    margin: '4px 0 0 0',
  } as React.CSSProperties,
  errorText: {
    fontSize: '14px',
    color: '#d32f2f',
    margin: '0',
    padding: '8px',
    backgroundColor: '#ffebee',
    borderRadius: '4px',
  } as React.CSSProperties,
  submitButton: {
    padding: '14px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  } as React.CSSProperties,
};

export default ProfileSetupPage;
