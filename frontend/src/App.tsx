import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import BrowserPage from "./pages/BrowserPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<BrowserPage />} />
    </Routes>
  );
}
