import { useEffect } from 'react';
import '../App.css';

/**
 * ログイン画面コンポーネント
 *
 * フロントエンド設計書に基づき、LINE認証を使用したログイン機能を提供します。
 * - アプリの概要説明を表示
 * - LINE公式アカウントの友達追加を促す説明
 * - LINEでログインボタン（bot_prompt=aggressiveを指定）
 */
const LoginPage = () => {
  // LINE Login設定
  const LINE_CLIENT_ID = '2008314080';
  const REDIRECT_URI = `${window.location.origin}/auth/callback`;
  const STATE = Math.random().toString(36).substring(7); // CSRF対策用のstate

  useEffect(() => {
    // stateをsessionStorageに保存（コールバック時の検証用）
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
    <div style={styles.container}>
      <div style={styles.card}>
        {/* アプリロゴ・タイトル */}
        <div style={styles.header}>
          <h1 style={styles.title}>家族つながるクイズアプリ</h1>
          <p style={styles.subtitle}>思い出クイズで安否確認</p>
        </div>

        {/* アプリの概要説明 */}
        <div style={styles.description}>
          <h2 style={styles.sectionTitle}>アプリについて</h2>
          <p style={styles.text}>
            このアプリは、祖父母が家族に向けてクイズを出題し、家族が楽しく回答することで、
            自然な形で安否確認ができるサービスです。
          </p>
          <ul style={styles.featureList}>
            <li>祖父母の思い出や経験をクイズにして共有</li>
            <li>家族みんなで楽しみながら安否確認</li>
            <li>クイズが出題されない場合は自動でアラート通知</li>
          </ul>
        </div>

        {/* LINE友達追加の説明 */}
        <div style={styles.lineInfo}>
          <h2 style={styles.sectionTitle}>LINE連携について</h2>
          <p style={styles.text}>
            このアプリはLINE通知機能を使用します。
            ログイン時にLINE公式アカウントの友達追加をお願いします。
          </p>
          <ul style={styles.featureList}>
            <li>新しいクイズが出題されたときにLINEで通知</li>
            <li>緊急通知をLINEで受け取り</li>
            <li>クイズ未出題時のアラートをLINEで受け取り</li>
          </ul>
        </div>

        {/* LINEでログインボタン */}
        <button
          onClick={handleLineLogin}
          style={styles.loginButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#00B900';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#06C755';
          }}
        >
          <span style={styles.buttonText}>LINEでログイン</span>
        </button>

        {/* 注意事項 */}
        <p style={styles.note}>
          ログインすることで、利用規約とプライバシーポリシーに同意したものとみなします。
        </p>
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
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  } as React.CSSProperties,
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  } as React.CSSProperties,
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: '0',
  } as React.CSSProperties,
  description: {
    marginBottom: '24px',
  } as React.CSSProperties,
  lineInfo: {
    marginBottom: '32px',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '12px',
  } as React.CSSProperties,
  text: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.6',
    marginBottom: '12px',
  } as React.CSSProperties,
  featureList: {
    fontSize: '14px',
    color: '#555',
    lineHeight: '1.8',
    paddingLeft: '20px',
    margin: '0',
  } as React.CSSProperties,
  loginButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#06C755',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginBottom: '16px',
  } as React.CSSProperties,
  buttonText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  note: {
    fontSize: '12px',
    color: '#999',
    textAlign: 'center',
    margin: '0',
  } as React.CSSProperties,
};

export default LoginPage;
