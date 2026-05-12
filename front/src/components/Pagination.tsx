export default function Pagination({ page, setPage }: any) {
  return (
    <div>
      <button onClick={() => setPage(page - 1)} disabled={page === 1}>
        Précédent
      </button>

      <span>Page {page}</span>

      <button onClick={() => setPage(page + 1)}>
        Suivant
      </button>
    </div>
  );
}