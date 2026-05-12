import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CandidateList from "../components/CandidateList";

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0
      }
    }
  });

function renderWithProviders() {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CandidateList />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

test("affiche les candidats depuis l'API mockée", async () => {
  renderWithProviders();

  await waitFor(() => expect(screen.getByText("Jean Dupont")).toBeInTheDocument());
  expect(screen.getByText("jean@mail.com")).toBeInTheDocument();
  expect(screen.getByText("Marie Curie")).toBeInTheDocument();
});

test("filtre les candidats en appelant l'API avec search et status", async () => {
  renderWithProviders();

  const searchInput = screen.getByLabelText("Recherche") as HTMLInputElement;
  const statusSelect = screen.getByLabelText("Statut") as HTMLSelectElement;
  const submitButton = screen.getByRole("button", { name: /Appliquer/i });

  fireEvent.change(searchInput, { target: { value: "Marie" } });
  fireEvent.change(statusSelect, { target: { value: "validated" } });
  fireEvent.click(submitButton);

  await waitFor(() => expect(screen.getByText("Marie Curie")).toBeInTheDocument());
  expect(screen.queryByText("Jean Dupont")).not.toBeInTheDocument();
});
