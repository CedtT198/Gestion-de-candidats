import { useState } from "react";
import { Link } from "react-router-dom";
import { useCandidates } from "../hooks/useCandidates";
import Pagination from "./Pagination";

export default function CandidateList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("");

  const { data, isLoading, error } = useCandidates(page, {
    search: activeSearch,
    status: activeStatus
  });

  const handleFilter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setActiveSearch(search);
    setActiveStatus(status);
  };

  return (
    <div>
      <h1>Liste des candidats</h1>

      <Link to={`/candidate/new`}>Créer un candidat</Link>

      <form onSubmit={handleFilter} style={{ marginBottom: 16 }}>
        <div>
          <label htmlFor="search">Recherche</label>
          <input
            id="search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nom, email ou téléphone"
          />
        </div>

        <div>
          <label htmlFor="status">Statut</label>
          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">Tous</option>
            <option value="pending">En attente</option>
            <option value="validated">Validé</option>
          </select>
        </div>

        <button type="submit">Appliquer</button>
      </form>

      {isLoading && <p>Chargement...</p>}
      {error && <p role="alert">Erreur de chargement des candidats.</p>}

      {!isLoading && !error && (
        <>
          {data?.items.length === 0 ? (
            <p>Aucun candidat trouvé.</p>
          ) : (
            <div>
              {data?.items.map((candidate: any) => (
                <article key={candidate._id} style={{ marginBottom: 16, padding: 12, border: "1px solid #ddd" }}>
                  <Link to={`/candidate/${candidate._id}`}>
                    <strong>{candidate.firstName} {candidate.lastName}</strong>
                  </Link>
                  <p>{candidate.email}</p>
                  <p>{candidate.phone}</p>
                  <p>Statut : {candidate.status}</p>
                </article>
              ))}
            </div>
          )}

          <Pagination
            page={page}
            setPage={(nextPage: number) => {
              if (nextPage >= 1 && nextPage <= (data?.pages || page + 1)) {
                setPage(nextPage);
              }
            }}
          />
          <p>
            Page {data?.page} / {data?.pages} — Total : {data?.total}
          </p>
        </>
      )}
    </div>
  );
}