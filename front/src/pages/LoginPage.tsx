import { useEffect } from 'react';

/**
 * ログイン画面コンポーネント
 *
 * フロントエンド設計書に基づき、LINE認証を使用したログイン機能を提供します。
 * - アプリの概要説明を表示
 * - LINE公式アカウントの友達追加を促す説明
 * - LINEでログインボタン(bot_prompt=aggressiveを指定)
 */
const LoginPage = () => {
  // LINE Login設定
  const LINE_CLIENT_ID = '2008314080';
  const REDIRECT_URI = `${window.location.origin}/auth/callback`;
  const STATE = Math.random().toString(36).substring(7); // CSRF対策用のstate

  useEffect(() => {
    // stateをsessionStorageに保存(コールバック時の検証用)
    sessionStorage.setItem('line_login_state', STATE);
  }, [STATE]);

  /**
   * LINEログインボタンクリック時の処理
   * bot_prompt=aggressiveを指定し、LINE公式アカウントの友達追加を促す
   */
  const handleLineLogin = () => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: LINE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      state: STATE,
      scope: 'profile openid',
      // LINE公式アカウントの友達追加を促すパラメータ
      bot_prompt: 'aggressive',
    });

    // LINE認証画面へリダイレクト
    window.location.href = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-line-bg px-4 py-8">
      <div className="card max-w-2xl w-full">
        {/* アプリロゴ・タイトル */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            家族つながるクイズアプリ
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            思い出クイズで安否確認
          </p>
        </div>

        {/* アプリの概要説明 */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📱</span>
            アプリについて
          </h2>
          <p className="text-base-readable text-gray-700 mb-4 leading-relaxed">
            このアプリは、祖父母が家族に向けてクイズを出題し、家族が楽しく回答することで、
            自然な形で安否確認ができるサービスです。
          </p>
          <ul className="space-y-2 text-base-readable text-gray-700">
            <li className="flex items-start">
              <span className="text-line-green mr-2 mt-1">✓</span>
              <span>祖父母の思い出や経験をクイズにして共有</span>
            </li>
            <li className="flex items-start">
              <span className="text-line-green mr-2 mt-1">✓</span>
              <span>家族みんなで楽しみながら安否確認</span>
            </li>
            <li className="flex items-start">
              <span className="text-line-green mr-2 mt-1">✓</span>
              <span>クイズが出題されない場合は自動でアラート通知</span>
            </li>
          </ul>
        </div>

        {/* LINE友達追加の説明 */}
        <div className="bg-line-green-50 border-2 border-line-green-200 rounded-soft p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🔔</span>
            LINE連携について
          </h2>
          <p className="text-base-readable text-gray-700 mb-4 leading-relaxed">
            このアプリはLINE通知機能を使用します。
            ログイン時にLINE公式アカウントの友達追加をお願いします。
          </p>
          <ul className="space-y-2 text-base-readable text-gray-700">
            <li className="flex items-start">
              <span className="text-line-green mr-2 mt-1">✓</span>
              <span>新しいクイズが出題されたときにLINEで通知</span>
            </li>
            <li className="flex items-start">
              <span className="text-line-green mr-2 mt-1">✓</span>
              <span>緊急通知をLINEで受け取り</span>
            </li>
            <li className="flex items-start">
              <span className="text-line-green mr-2 mt-1">✓</span>
              <span>クイズ未出題時のアラートをLINEで受け取り</span>
            </li>
          </ul>
        </div>

        {/* LINEでログインボタン */}
        <button
          onClick={handleLineLogin}
          className="w-full btn-primary py-4 text-lg md:text-xl mb-4"
        >
          LINEでログイン
        </button>

        {/* 注意事項 */}
        <p className="text-sm text-gray-500 text-center">
          ログインすることで、利用規約とプライバシーポリシーに同意したものとみなします。
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
