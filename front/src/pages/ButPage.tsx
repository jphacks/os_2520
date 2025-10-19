// src/pages/ButPage.tsx
import { useLocation, useNavigate } from "react-router-dom";

function ButPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const nickname = (location.state as { nickname: string })?.nickname;

  return (
    <div className="min-h-screen flex items-center justify-center bg-line-bg px-4">
      <div className="card text-center max-w-md w-full">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          {nickname}さん
        </h2>
        <p className="text-lg-readable text-gray-700 mb-8">質問に答えてね</p>
        <div className="space-y-3">
          <button onClick={() => navigate("/")} className="w-full btn-secondary">
            戻る
          </button>
          <button className="w-full btn-primary">回答</button>
        </div>
      </div>
    </div>
  );
}

export default ButPage;
