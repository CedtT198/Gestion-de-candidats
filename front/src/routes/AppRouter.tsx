import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CandidateList from "../components/CandidateList";
import DetailPage from "../pages/DetailPage";
import LoginForm from "../pages/LoginForm";
import CandidatePage from "../pages/CandidatePage";
import EditPage from "../pages/EditPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/candidate/login" />} />
        <Route path="/candidate/login" element={<LoginForm />} />
        <Route path="/candidates" element={<CandidateList />} />
        <Route path="/candidate/new" element={<CandidatePage />} />
        <Route path="/candidate/:id" element={<DetailPage />} />
        <Route path="/candidate/:id/edit" element={<EditPage />} />
      </Routes>
    </BrowserRouter>
  );
}