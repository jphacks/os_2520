import { useNavigate } from 'react-router-dom';

/**
 * 家族グループ選択/作成画面
 *
 * フロントエンド設計書に基づき、以下の2つの選択肢を提供します:
 * - 新しい家族グループを作成
 * - 既存グループに参加
 */
const GroupSetupPage = () => {
  const navigate = useNavigate();

  /**
   * 「新しい家族グループを作成」ボタンクリック時の処理
   */
  const handleCreateGroup = () => {
    navigate('/group/create');
  };

  /**
   * 「既存グループに参加」ボタンクリック時の処理
   */
  const handleJoinGroup = () => {
    navigate('/group/join');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-line-bg px-4 py-8">
      <div className="card max-w-2xl w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">
          家族グループの設定
        </h1>
        <p className="text-base text-gray-600 mb-8 text-center">
          家族グループを作成するか、既存のグループに参加してください
        </p>

        <div className="space-y-4 mb-8">
          {/* 新しい家族グループを作成ボタン */}
          <button
            onClick={handleCreateGroup}
            className="w-full flex items-center p-6 bg-line-green text-white rounded-soft hover:bg-line-green-600 transition-all shadow-md"
          >
            <div className="text-4xl mr-4">➕</div>
            <div className="text-left flex-1">
              <div className="text-lg md:text-xl font-bold mb-1">
                新しい家族グループを作成
              </div>
              <div className="text-sm md:text-base opacity-90">
                代表者としてグループを作成し、家族を招待します
              </div>
            </div>
          </button>

          {/* 既存グループに参加ボタン */}
          <button
            onClick={handleJoinGroup}
            className="w-full flex items-center p-6 bg-white text-gray-800 rounded-soft border-2 border-line-green hover:bg-line-green-50 transition-all"
          >
            <div className="text-4xl mr-4">🔗</div>
            <div className="text-left flex-1">
              <div className="text-lg md:text-xl font-bold mb-1">
                既存グループに参加
              </div>
              <div className="text-sm md:text-base text-gray-600">
                招待されたグループIDを入力して参加します
              </div>
            </div>
          </button>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-soft p-5">
          <p className="font-bold text-gray-800 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            ヒント
          </p>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            家族の代表者が先にグループを作成し、その後他のメンバーが招待IDを使って参加します。
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupSetupPage;
