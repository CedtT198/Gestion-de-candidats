import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCandidate } from "../api/candidates.api";
import CandidateForm from "../components/CandidateForm";

export default function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: candidate, isLoading, error } = useQuery({
    queryKey: ["candidate", id],
    queryFn: () => getCandidate(id!)
  });

  if (isLoading) return <p>Chargement...</p>;
  if (error) return <p role="alert">Erreur lors du chargement du candidat.</p>;
  if (!candidate) return <p>Candidat non trouvé.</p>;

  return (
    <div>
      <h1>Modifier {candidate.firstName} {candidate.lastName}</h1>
      <button onClick={() => navigate(`/candidate/${id}`)} style={{ marginBottom: 16 }}>
        ← Retour au détail
      </button>
      <CandidateForm defaultValues={candidate} id={id} />
    </div>
  );
}
