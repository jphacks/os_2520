import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../lib/axios';

/**
 * LINE認証コールバック画面
 *
 * LINE認証後のリダイレクト先として機能します。
 * 1. LINEから認可コードを受け取る
 * 2. バックエンドの /auth/line に認可コードを送信
 * 3. バックエンド側でIDトークンの取得と検証を行い、JWTトークンと isNewUser フラグを受け取る
 * 4. 新規ユーザーの場合はプロフィール入力画面へ、既存ユーザーはホームへ遷移
 */
const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URLパラメータからcodeとstateを取得
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // エラーチェック
        if (error) {
          throw new Error(errorDescription || 'LINE認証がキャンセルされました');
        }

        if (!code) {
          throw new Error('認証コードが取得できませんでした');
        }

        // CSRF対策: stateの検証
        const savedState = sessionStorage.getItem('line_login_state');
        if (state !== savedState) {
          throw new Error('不正なリクエストです');
        }

        // バックエンドの /auth/line に認可コードを送信
        // バックエンド側でIDトークンの取得と検証を行う
        // apiClient は withCredentials: true が設定済み
        const authResponse = await apiClient.post('/auth/line', { code: code });

        // バックエンドはJWTトークンをhttpOnly Cookieに設定するため、
        // フロントエンド側ではlocalStorageに保存する必要はない
        const { isNewUser } = authResponse.data;

        // sessionStorageのstateをクリア
        sessionStorage.removeItem('line_login_state');

        // 遷移先を決定
        if (isNewUser) {
          // 新規ユーザーはプロフィール入力画面へ
          navigate('/profile-setup');
        } else {
          // 既存ユーザーの場合、ユーザー情報を取得して遷移先を決定
          const userResponse = await apiClient.get('/users/me');
          const user = userResponse.data;

          // プロフィール未設定（displayNameがない）場合はプロフィール設定画面へ
          if (!user.role) {
            navigate('/profile-setup');
          }
          // グループ未所属の場合はグループ設定画面へ
          else if (!user.hasGroup) {
            navigate('/group-setup');
          }
          // すべて設定済みの場合は役割に応じたホーム画面へ
          else {
            if (user.role === 'grandparent') {
              navigate('/old'); // 祖父母ダッシュボード
            } else {
              navigate('/yang'); // 子・孫ダッシュボード
            }
          }
        }
      } catch (err: any) {
        console.error('認証エラー:', err);
        setError(err.message || '認証処理中にエラーが発生しました');
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  // ローディング中の表示
  if (loading && !error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>認証処理中...</p>
        </div>
      </div>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.errorTitle}>エラーが発生しました</h2>
          <p style={styles.errorText}>{error}</p>
          <button
            onClick={() => navigate('/login')}
            style={styles.retryButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
            }}
          >
            ログイン画面に戻る
          </button>
        </div>
      </div>
    );
  }

  return null;
};

// スタイル定義
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  } as React.CSSProperties,
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  } as React.CSSProperties,
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #06C755',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
  } as React.CSSProperties,
  loadingText: {
    fontSize: '16px',
    color: '#666',
    margin: '0',
  } as React.CSSProperties,
  errorTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: '16px',
  } as React.CSSProperties,
  errorText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '24px',
    lineHeight: '1.6',
  } as React.CSSProperties,
  retryButton: {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
};

// スピナーアニメーション用のCSSを追加
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default AuthCallbackPage;
