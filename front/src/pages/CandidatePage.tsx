import { useNavigate } from "react-router-dom";
import CandidateForm from "../components/CandidateForm";

export default function CandidatePage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Créer un candidat</h1>
      <button onClick={() => navigate("/candidates")} style={{ marginBottom: 16 }}>
        ← Retour à la liste
      </button>
      <CandidateForm />
    </div>
  );
}
