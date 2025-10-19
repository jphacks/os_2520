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
    <div className="min-h-screen flex items-center justify-center bg-line-bg px-4 py-8">
      <div className="card max-w-lg w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">
          ユーザー情報入力
        </h1>
        <p className="text-base text-gray-600 mb-8 text-center">
          あなたの役割と氏名を入力してください
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 役割選択 */}
          <div>
            <label className="block text-base-readable font-bold text-gray-800 mb-3">
              役割を選択 *
            </label>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <label
                className={`
                  flex items-center justify-center p-4 rounded-soft border-2 cursor-pointer transition-all
                  ${role === 'grandparent'
                    ? 'border-line-green bg-line-green-50 text-line-green-700'
                    : 'border-gray-300 bg-white hover:border-line-green-300'
                  }
                `}
              >
                <input
                  type="radio"
                  name="role"
                  value="grandparent"
                  checked={role === 'grandparent'}
                  onChange={(e) => setRole(e.target.value as 'grandparent' | 'family')}
                  className="sr-only"
                />
                <span className="text-3xl mr-2">👴👵</span>
                <span className="text-base-readable font-bold">祖父母</span>
              </label>
              <label
                className={`
                  flex items-center justify-center p-4 rounded-soft border-2 cursor-pointer transition-all
                  ${role === 'family'
                    ? 'border-line-green bg-line-green-50 text-line-green-700'
                    : 'border-gray-300 bg-white hover:border-line-green-300'
                  }
                `}
              >
                <input
                  type="radio"
                  name="role"
                  value="family"
                  checked={role === 'family'}
                  onChange={(e) => setRole(e.target.value as 'grandparent' | 'family')}
                  className="sr-only"
                />
                <span className="text-3xl mr-2">👨👩</span>
                <span className="text-base-readable font-bold">子・孫</span>
              </label>
            </div>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-soft">
              {role === 'grandparent'
                ? '✓ クイズを出題する側として登録します'
                : '✓ クイズに回答する側として登録します'}
            </p>
          </div>

          {/* 氏名入力 */}
          <div>
            <label htmlFor="displayName" className="block text-base-readable font-bold text-gray-800 mb-2">
              氏名(アプリ内表示名) *
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="例: 山田太郎"
              maxLength={20}
              className="input-field"
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">最大20文字</p>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-soft">
              {error}
            </div>
          )}

          {/* 次へボタン */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 text-lg"
          >
            {loading ? '登録中...' : '次へ'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
