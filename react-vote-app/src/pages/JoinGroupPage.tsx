import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../lib/axios';

/**
 * グループ参加画面
 *
 * フロントエンド設計書に基づき、以下の項目を入力します:
 * - 招待されたグループID（英数字8文字）
 * - パスワード（最低8文字、最長36文字）
 */
const JoinGroupPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groupId, setGroupId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 「グループに参加」ボタンクリック時の処理
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // バリデーション
    if (!groupId.trim()) {
      setError('グループIDを入力してください');
      return;
    }
    if (groupId.trim().length !== 8) {
      setError('グループIDは8文字で入力してください');
      return;
    }
    if (!password) {
      setError('パスワードを入力してください');
      return;
    }
    if (password.length < 8 || password.length > 36) {
      setError('パスワードは8文字以上、36文字以内で入力してください');
      return;
    }

    setLoading(true);

    try {
      // POST /groups/join を呼び出してグループに参加
      await apiClient.post('/groups/join', {
        groupId: groupId.trim().toUpperCase(),
        password: password,
      });

      // 参加成功後、役割に応じたダッシュボードへ遷移
      if (user?.role === 'grandparent') {
        navigate('/old/dashboard'); // 祖父母ダッシュボード
      } else {
        navigate('/yang/dashboard'); // 子・孫ダッシュボード
      }
    } catch (err: any) {
      console.error('グループ参加エラー:', err);
      if (err.response?.status === 404) {
        setError('グループIDまたはパスワードが間違っています');
      } else if (err.response?.data?.errors) {
        // バリデーションエラーの場合
        const errors = err.response.data.errors;
        setError(errors.map((e: any) => e.message).join(', '));
      } else {
        setError(
          err.response?.data?.error || 'グループへの参加に失敗しました'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * グループIDの入力を大文字に変換して制限
   */
  const handleGroupIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    // 英数字のみ、最大8文字
    if (/^[A-Z0-9]*$/.test(value) && value.length <= 8) {
      setGroupId(value);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>既存グループに参加</h1>
        <p style={styles.subtitle}>
          招待されたグループIDとパスワードを入力してください
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* グループID */}
          <div style={styles.formGroup}>
            <label htmlFor="groupId" style={styles.label}>
              招待されたグループID *
            </label>
            <input
              id="groupId"
              type="text"
              value={groupId}
              onChange={handleGroupIdChange}
              placeholder="例: A1B2C3D4"
              maxLength={8}
              style={{
                ...styles.input,
                ...styles.groupIdInput,
              }}
              disabled={loading}
            />
            <p style={styles.hint}>英数字8文字（自動的に大文字に変換されます）</p>
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
              placeholder="グループのパスワードを入力"
              minLength={8}
              maxLength={36}
              style={styles.input}
              disabled={loading}
            />
            <p style={styles.hint}>最低8文字、最長36文字</p>
          </div>

          {/* 情報ボックス */}
          <div style={styles.infoBox}>
            <p style={styles.infoTitle}>💡 グループIDの確認方法</p>
            <p style={styles.infoContent}>
              グループIDは、グループを作成した代表者から共有されます。
              <br />
              LINEなどで送られた8文字のIDを入力してください。
            </p>
          </div>

          {/* エラーメッセージ */}
          {error && <p style={styles.errorText}>{error}</p>}

          {/* ボタングループ */}
          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => navigate('/group-setup')}
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
                  e.currentTarget.style.backgroundColor = '#0056b3';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#007bff';
                }
              }}
            >
              {loading ? '参加中...' : 'グループに参加する'}
            </button>
          </div>
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
  input: {
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.2s',
  } as React.CSSProperties,
  groupIdInput: {
    fontFamily: 'monospace',
    fontSize: '18px',
    letterSpacing: '2px',
    textAlign: 'center',
    fontWeight: 'bold',
  } as React.CSSProperties,
  hint: {
    fontSize: '12px',
    color: '#999',
    margin: '4px 0 0 0',
  } as React.CSSProperties,
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #90caf9',
  } as React.CSSProperties,
  infoTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: '8px',
    margin: '0 0 8px 0',
  } as React.CSSProperties,
  infoContent: {
    fontSize: '13px',
    color: '#1565c0',
    lineHeight: '1.6',
    margin: '0',
  } as React.CSSProperties,
  errorText: {
    fontSize: '14px',
    color: '#d32f2f',
    margin: '0',
    padding: '8px',
    backgroundColor: '#ffebee',
    borderRadius: '4px',
  } as React.CSSProperties,
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  } as React.CSSProperties,
  backButton: {
    flex: 1,
    padding: '14px',
    backgroundColor: 'white',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
  submitButton: {
    flex: 2,
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

export default JoinGroupPage;
