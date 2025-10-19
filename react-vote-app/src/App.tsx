// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import SelectPage1 from "./pages/SelectPage1.tsx";
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

          {/* ホーム（リダイレクト専用） */}
          <Route path="/home" element={<HomePage />} />

          {/* ダッシュボード */}
          <Route path="/old" element={<Old />} />
          <Route path="/old/dashboard" element={<OldDashboard />} />
          <Route path="/yang" element={<Yang />} />
          <Route path="/yang/dashboard" element={<YangDashboard />} /> {/* 追加 */}     

          {/* 既存のルート（後で整理予定） */}
          <Route path="/" element={<SelectPage1 />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;