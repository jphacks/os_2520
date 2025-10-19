import { useState } from 'react';
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
    <div className="min-h-screen bg-line-bg py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h2 className="text-xl-readable font-bold text-center mb-6 text-gray-800">リクエストを送る</h2>

          {/* ポイント残高表示 */}
          <div className="mb-6">
            <div className="bg-line-green-50 rounded-soft p-4 mb-2 flex justify-between items-center border-2 border-line-green-200">
              <span className="text-sm-readable text-gray-600">現在のポイント</span>
              <span className="text-3xl font-bold text-line-green">{user?.points ?? 0} P</span>
            </div>
            <p className="text-xs-readable text-gray-600 text-center">
              リクエスト送信には <strong>10ポイント</strong> 必要です
            </p>
          </div>

          {/* リクエストタイプ選択 */}
          <div className="mb-6">
            <label className="block text-base-readable font-semibold text-gray-700 mb-2">リクエストの種類</label>
            <div className="flex gap-3 mb-2">
              <button
                className={`flex-1 py-3 px-4 rounded-soft font-semibold text-sm-readable transition-all ${
                  requestType === 'quiz'
                    ? 'bg-line-green text-white border-2 border-line-green'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-line-green'
                }`}
                onClick={() => setRequestType('quiz')}
              >
                クイズリクエスト
              </button>
              <button
                className={`flex-1 py-3 px-4 rounded-soft font-semibold text-sm-readable transition-all ${
                  requestType === 'other'
                    ? 'bg-line-green text-white border-2 border-line-green'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-line-green'
                }`}
                onClick={() => setRequestType('other')}
              >
                その他リクエスト
              </button>
            </div>
            <p className="text-xs-readable text-gray-600">
              {requestType === 'quiz'
                ? 'クイズのテーマをリクエストできます。祖父母がクイズを作成する際に参考にします。'
                : '次の帰省時のリクエストなどを送信できます。祖父母にLINE通知が届きます。'}
            </p>
          </div>

          {/* おすすめテーマ */}
          <div className="mb-6">
            <label className="block text-base-readable font-semibold text-gray-700 mb-2">おすすめテーマ</label>
            <div className="grid grid-cols-2 gap-2">
              {currentThemes.map((theme) => (
                <button
                  key={theme}
                  className="py-3 px-3 border-2 border-gray-200 rounded-soft bg-white text-sm-readable hover:border-line-green hover:bg-line-green-50 transition-all text-left"
                  onClick={() => handleThemeClick(theme)}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* 自由入力 */}
          <div className="mb-6">
            <label className="block text-base-readable font-semibold text-gray-700 mb-2" htmlFor="content">
              リクエスト内容
            </label>
            <textarea
              id="content"
              className="textarea-field"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="リクエスト内容を入力してください..."
              rows={4}
              disabled={isLoading}
            />
            <div className="text-xs-readable text-gray-400 text-right mt-1">{content.length}/200</div>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-soft p-4 mb-4">
              <p className="text-base-readable text-red-700">{error}</p>
            </div>
          )}

          {/* ボタン */}
          <div className="flex gap-3">
            <button
              className="btn-secondary flex-1"
              onClick={() => navigate('/yang')}
              disabled={isLoading}
            >
              キャンセル
            </button>
            <button
              className="btn-primary flex-1"
              onClick={handleSubmit}
              disabled={!hasEnoughPoints || !content.trim() || isLoading}
            >
              {isLoading ? '送信中...' : '送信 (-10P)'}
            </button>
          </div>
        </div>

        {/* 成功モーダル */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-soft p-10 text-center max-w-md shadow-2xl">
              <div className="text-6xl mb-4">
                <span className="inline-flex items-center justify-center w-20 h-20 bg-line-green rounded-full">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </div>
              <h3 className="text-xl-readable font-bold mb-3 text-gray-800">送信完了!</h3>
              <p className="text-base-readable text-gray-600 leading-relaxed">
                リクエストを送信しました。
                <br />
                残りポイント: <span className="font-bold text-line-green">{user?.points ?? 0} P</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestPage;
