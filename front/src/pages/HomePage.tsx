import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ホームページ(リダイレクト専用)
 *
 * ユーザーの状態に応じて適切な画面にリダイレクトします:
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
      navigate('/old/dashboard'); // 祖父母ダッシュボード
    } else {
      navigate('/yang/dashboard'); // 子・孫ダッシュボード
    }
  }, [user, loading, navigate]);

  // ローディング中の表示
  return (
    <div className="min-h-screen flex items-center justify-center bg-line-bg">
      <div className="card text-center max-w-md">
        <div className="inline-block w-16 h-16 border-4 border-line-green border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg-readable text-gray-700">読み込み中...</p>
      </div>
    </div>
  );
};

export default HomePage;
