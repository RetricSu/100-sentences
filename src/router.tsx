import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home";
import { WrongWordBookPage } from "./pages/word-book";
import TransformerTestPage from "./pages/transformer-test";

export function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wrong-words" element={<WrongWordBookPage />} />
        <Route path="/transformer-test" element={<TransformerTestPage />} />
      </Routes>
    </Router>
  );
}
