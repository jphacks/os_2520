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
    <div className="min-h-screen flex items-center justify-center bg-line-bg px-4 py-8">
      <div className="card max-w-2xl w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
          あんしんクイズ便
        </h1>
        <h3 className="text-lg md:text-xl text-gray-600 mb-8 text-center">
          ユーザー名と選択をしてください
        </h3>

        <div className="flex flex-col gap-6">
          {/* ユーザー名入力 */}
          <div className="flex flex-col">
            <label className="text-sm-readable font-bold text-gray-800 mb-2">
              ユーザー名
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="入力してください"
              className="input-field"
            />
          </div>

          {/* 役割選択 */}
          <div className="flex flex-col">
            <label className="text-sm-readable font-bold text-gray-800 mb-3">
              選択
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-300 rounded-soft hover:border-line-green transition-colors duration-200 flex-1">
                <input
                  type="radio"
                  name="choice"
                  value="A"
                  checked={choice === "A"}
                  onChange={(e) => setChoice(e.target.value)}
                  className="w-5 h-5 text-line-green focus:ring-line-green"
                />
                <span className="text-base-readable font-medium text-gray-800">
                  祖父母
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-300 rounded-soft hover:border-line-green transition-colors duration-200 flex-1">
                <input
                  type="radio"
                  name="choice"
                  value="B"
                  checked={choice === "B"}
                  onChange={(e) => setChoice(e.target.value)}
                  className="w-5 h-5 text-line-green focus:ring-line-green"
                />
                <span className="text-base-readable font-medium text-gray-800">
                  孫・子
                </span>
              </label>
            </div>
          </div>

          {/* 送信ボタン */}
          <button onClick={handleSubmit} className="btn-primary py-4 text-lg mt-4">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectPage1;