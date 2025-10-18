// src/pages/HappyPage.tsx
import { useLocation, useNavigate } from "react-router-dom";

function HappyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const nickname = (location.state as { nickname: string })?.nickname;

  return (
    <div>
      <h2>{nickname}さん
        <p>質問を送信してね</p>
      </h2>
      <button onClick={() => navigate("/")}>戻る</button>
      <button>送信</button>
    </div>
  );
}

export default HappyPage;