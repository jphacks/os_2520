// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SelectPage1 from "./pages/SelectPage1.tsx";
import Old from "./pages/Old.tsx";
import Yang from "./pages/Yang.tsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SelectPage1 />} />
        <Route path="/old" element={<Old />} />
        <Route path="/yang" element={<Yang />} />
        
      </Routes>
    </Router>
  );
}

export default App;