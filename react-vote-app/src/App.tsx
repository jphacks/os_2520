// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SelectPage1 from "./pages/SelectPage1.tsx";
import Old from "./pages/Old.tsx";
import Yang from "./pages/Yang.tsx";
import OldDashboard from "./pages/Old_dashboard"; // 追加


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SelectPage1 />} />
        <Route path="/old" element={<Old />} />
        <Route path="/old/dashboard" element={<OldDashboard />} /> {/* 追加 */}
        <Route path="/yang" element={<Yang />} />

        
      </Routes>
    </Router>
  );
}

export default App;