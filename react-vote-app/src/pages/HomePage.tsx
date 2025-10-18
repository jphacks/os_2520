import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ホームページ（リダイレクト専用）
 *
 * ユーザーの状態に応じて適切な画面にリダイレクトします：
 * 1. 未認証 → ログイン画面
 * 2. プロフィール未設定 → プロフィール設定画面
 * 3. グループ未所属 → グループ設定画面
 * 4. すべて設定済み → 役割に応じたダッシュボード
 */
const HomePage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // ローディング中は何もしない

    // 未認証の場合はログイン画面へ
    if (!user) {
      navigate('/login');
      return;
    }

    // プロフィール未設定の場合はプロフィール設定画面へ
    if (!user.role) {
      navigate('/profile-setup');
      return;
    }

    // グループ未所属の場合はグループ設定画面へ
    if (!user.hasGroup) {
      navigate('/group-setup');
      return;
    }

    // すべて設定済みの場合は役割に応じたダッシュボードへ
    if (user.role === 'grandparent') {
      navigate('/old'); // 祖父母ダッシュボード
    } else {
      navigate('/yang'); // 子・孫ダッシュボード
    }
  }, [user, loading, navigate]);

  // ローディング中の表示
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>読み込み中...</p>
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
    borderTop: '4px solid #007bff',
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
};

// スピナーアニメーション用のCSSを追加
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  try {
    styleSheet.insertRule(`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `, styleSheet.cssRules.length);
  } catch (e) {
    // アニメーションが既に定義されている場合は無視
  }
}

export default HomePage;
