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
    <div className="min-h-screen flex items-center justify-center bg-line-bg px-4 py-8">
      <div className="card max-w-2xl w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">
          既存グループに参加
        </h1>
        <p className="text-sm md:text-base text-gray-600 mb-8 text-center">
          招待されたグループIDとパスワードを入力してください
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* グループID */}
          <div className="flex flex-col">
            <label
              htmlFor="groupId"
              className="text-sm-readable font-bold text-gray-800 mb-2"
            >
              招待されたグループID *
            </label>
            <input
              id="groupId"
              type="text"
              value={groupId}
              onChange={handleGroupIdChange}
              placeholder="例: A1B2C3D4"
              maxLength={8}
              className="input-field font-mono text-lg tracking-wider text-center font-bold"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              英数字8文字（自動的に大文字に変換されます）
            </p>
          </div>

          {/* パスワード */}
          <div className="flex flex-col">
            <label
              htmlFor="password"
              className="text-sm-readable font-bold text-gray-800 mb-2"
            >
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
              className="input-field"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">最低8文字、最長36文字</p>
          </div>

          {/* 情報ボックス */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-soft p-4">
            <p className="text-sm-readable font-bold text-blue-700 mb-2">
              💡 グループIDの確認方法
            </p>
            <p className="text-sm text-blue-600 leading-relaxed">
              グループIDは、グループを作成した代表者から共有されます。
              <br />
              LINEなどで送られた8文字のIDを入力してください。
            </p>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <p className="text-sm-readable text-red-700 bg-red-50 p-3 rounded-soft border border-red-200">
              {error}
            </p>
          )}

          {/* ボタングループ */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/group-setup')}
              disabled={loading}
              className="flex-1 btn-secondary"
            >
              戻る
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] btn-primary"
            >
              {loading ? '参加中...' : 'グループに参加する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinGroupPage;
