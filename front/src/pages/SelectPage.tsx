// src/pages/SelectPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SelectPage() {
  const [nickname, setNickname] = useState("");
  const [choice, setChoice] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!nickname || !choice) {
      alert("ユーザー名と選択を入力してください!");
      return;
    }

    if (choice === "A") {
      navigate("/happy", { state: { nickname } });
    } else if (choice === "B") {
      navigate("/but", { state: { nickname } });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-line-bg px-4">
      <div className="card max-w-lg w-full">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
          ユーザー名と選択をしてください
        </h2>

        {/* ユーザー名入力 */}
        <div className="mb-6">
          <label className="block text-base-readable font-bold text-gray-800 mb-2">
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

        {/* 選択 */}
        <div className="mb-8">
          <label className="block text-base-readable font-bold text-gray-800 mb-3">
            選択
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`
                flex items-center justify-center p-4 rounded-soft border-2 cursor-pointer transition-all
                ${choice === 'A'
                  ? 'border-line-green bg-line-green-50 text-line-green-700'
                  : 'border-gray-300 bg-white hover:border-line-green-300'
                }
              `}
            >
              <input
                type="radio"
                name="choice"
                value="A"
                checked={choice === "A"}
                onChange={(e) => setChoice(e.target.value)}
                className="sr-only"
              />
              <span className="text-3xl mr-2">👴👵</span>
              <span className="text-base-readable font-bold">祖父母</span>
            </label>

            <label
              className={`
                flex items-center justify-center p-4 rounded-soft border-2 cursor-pointer transition-all
                ${choice === 'B'
                  ? 'border-line-green bg-line-green-50 text-line-green-700'
                  : 'border-gray-300 bg-white hover:border-line-green-300'
                }
              `}
            >
              <input
                type="radio"
                name="choice"
                value="B"
                checked={choice === "B"}
                onChange={(e) => setChoice(e.target.value)}
                className="sr-only"
              />
              <span className="text-3xl mr-2">👨👩</span>
              <span className="text-base-readable font-bold">孫・子</span>
            </label>
          </div>
        </div>

        {/* OKボタン */}
        <button onClick={handleSubmit} className="w-full btn-primary py-4 text-lg">
          OK
        </button>
      </div>
    </div>
  );
}

export default SelectPage;
