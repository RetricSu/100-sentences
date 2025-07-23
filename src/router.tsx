import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home";
import { WrongWordBookPage } from "./pages/word-book";

export function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wrong-words" element={<WrongWordBookPage />} />
      </Routes>
    </Router>
  );
}
