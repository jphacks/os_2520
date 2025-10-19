// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import Old from "./pages/Old.tsx";
import Yang from "./pages/Yang.tsx";
import YangDashboard from "./pages/Yang_dashboard"; // 追加
import OldDashboard from "./pages/Old_dashboard";
import LoginPage from "./pages/LoginPage.tsx";
import AuthCallbackPage from "./pages/AuthCallbackPage.tsx";
import ProfileSetupPage from "./pages/ProfileSetupPage.tsx";
import GroupSetupPage from "./pages/GroupSetupPage.tsx";
import CreateGroupPage from "./pages/CreateGroupPage.tsx";
import JoinGroupPage from "./pages/JoinGroupPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import RequestPage from "./pages/RequestPage.tsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 認証関連のルート */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/profile-setup" element={<ProfileSetupPage />} />

          {/* グループ設定関連のルート */}
          <Route path="/group-setup" element={<GroupSetupPage />} />
          <Route path="/group/create" element={<CreateGroupPage />} />
          <Route path="/group/join" element={<JoinGroupPage />} />

          {/* ルートパスは /home にリダイレクト（HomePageが認証状態を判定） */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* ホーム（リダイレクト専用：認証状態とroleを判定して適切なページへ遷移） */}
          <Route path="/home" element={<HomePage />} />

          {/* 祖父母（grandparent）用ルート */}
          <Route path="/old" element={<Old />} /> {/* クイズ作成画面 */}
          <Route path="/old/dashboard" element={<OldDashboard />} /> {/* 祖父母ダッシュボード */}

          {/* 子・孫（family）用ルート */}
          <Route path="/yang" element={<Yang />} /> {/* クイズ回答画面 */}
          <Route path="/yang/dashboard" element={<YangDashboard />} /> {/* 子・孫ダッシュボード */}
          <Route path="/request" element={<RequestPage />} /> {/* リクエスト送信画面 */}

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;