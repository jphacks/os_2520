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
          // すべて設定済みの場合は役割に応じたダッシュボードへ
          else {
            if (user.role === 'grandparent') {
              navigate('/old/dashboard'); // 祖父母ダッシュボード
            } else {
              navigate('/yang/dashboard'); // 子・孫ダッシュボード
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
      <div className="min-h-screen flex items-center justify-center bg-line-bg">
        <div className="card max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-line-green rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-base-readable text-gray-600">認証処理中...</p>
        </div>
      </div>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-line-bg px-4">
        <div className="card max-w-md w-full text-center">
          <h2 className="text-xl md:text-2xl font-bold text-red-600 mb-4">
            エラーが発生しました
          </h2>
          <p className="text-sm-readable text-gray-600 mb-6 leading-relaxed">
            {error}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-3 px-6 rounded-soft transition-colors duration-200 text-base-readable"
          >
            ログイン画面に戻る
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallbackPage;
