// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import SelectPage1 from "./pages/SelectPage1.tsx";
import Old from "./pages/Old.tsx";
import Yang from "./pages/Yang.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import AuthCallbackPage from "./pages/AuthCallbackPage.tsx";
import ProfileSetupPage from "./pages/ProfileSetupPage.tsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 認証関連のルート */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/profile-setup" element={<ProfileSetupPage />} />

          {/* 既存のルート（後で整理予定） */}
          <Route path="/" element={<SelectPage1 />} />
          <Route path="/old" element={<Old />} />
          <Route path="/yang" element={<Yang />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;