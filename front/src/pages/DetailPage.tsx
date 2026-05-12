import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCandidate, validateCandidate, deleteCandidate } from "../api/candidates.api";
import { useState } from "react";

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["candidate", id],
    queryFn: () => getCandidate(id!)
  });

  const handleValidate = async () => {
    setLoading(true);
    try {
      await validateCandidate(id!);
      refetch();
      alert("Validation terminée");
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la validation");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce candidat ?")) return;
    
    setDeleteLoading(true);
    try {
      await deleteCandidate(id!);
      navigate("/candidates");
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isLoading) return <p>Chargement...</p>;
  if (!data) return <p>Candidat non trouvé.</p>;

  return (
    <div>
      <button onClick={() => navigate("/candidates")} style={{ marginBottom: 16 }}>
        ← Retour à la liste
      </button>
      
      <h1>{data.firstName} {data.lastName}</h1>
      <p><strong>Email :</strong> {data.email}</p>
      <p><strong>Téléphone :</strong> {data.phone}</p>
      <p><strong>Statut :</strong> {data.status}</p>

      <div style={{ marginTop: 16, display: "flex", gap: "8px" }}>
        {data.status === "pending" && 
          <button onClick={handleValidate} disabled={loading}>
            {loading ? "Validation..." : "Valider"}
          </button>
        }
        {data.status === "validated" && <span>✓ Candidat validé</span>}
        
        <button onClick={() => navigate(`/candidate/${id}/edit`)}>
          Éditer
        </button>
        <button onClick={handleDelete} disabled={deleteLoading} style={{ backgroundColor: "#dc3545" }}>
          {deleteLoading ? "Suppression..." : "Supprimer"}
        </button>
      </div>
    </div>
  );
}