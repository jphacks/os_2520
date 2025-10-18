import { useLocation, useNavigate } from "react-router-dom";

function HappyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const nickname = (location.state as { nickname: string })?.nickname;


  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>{nickname}さん</h2>
<h2>質問に答えてね</h2>
      
      <button onClick={() => navigate("/")}>戻る</button>
      <button>回答</button>
    </div>
  );
}

export default HappyPage;