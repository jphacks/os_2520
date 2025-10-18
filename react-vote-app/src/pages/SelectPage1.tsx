// src/pages/SelectPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SelectPage1() {
  const [nickname, setNickname] = useState("");
  const [choice, setChoice] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!nickname || !choice) {
      alert("ユーザー名と選択を入力してください！");
      return;
    }

    if (choice === "A") {
      navigate("/old", { state: { nickname } });
    } else if (choice === "B") {
      navigate("/yang", { state: { nickname } });
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>ユーザー名と選択をしてください</h2>
      <div style={{ marginBottom: "15px" }}>
        <label>ユーザー名：</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="入力してください"
        />
      </div>
      <div>
        <p>選択：</p>
        <label style={{ marginRight: "10px" }}>
          <input
            type="radio"
            name="choice"
            value="A"
            checked={choice === "A"}
            onChange={(e) => setChoice(e.target.value)}
          />
          祖父母
        </label>

        <label>
          <input
            type="radio"
            name="choice"
            value="B"
            checked={choice === "B"}
            onChange={(e) => setChoice(e.target.value)}
          />
          孫・子
        </label>
      </div>

      <button
        onClick={handleSubmit}
        style={{ marginTop: "20px", padding: "6px 15px" }}
      >
        OK
      </button>
    </div>

  );
}

export default SelectPage1;