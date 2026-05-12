import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCandidates, type CandidatesResponse } from "../hooks/useCandidates";
import * as candidatesApi from "../api/candidates.api";

jest.mock("../api/candidates.api", () => ({
  ...jest.requireActual<object>("../api/candidates.api"),
  getCandidates: jest.fn()
}));

const queryClient = new QueryClient();

function renderWithQueryClient(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

function TestComponent({ page, filters }: { page: number; filters?: { search?: string; status?: string } }) {
  const { data, isLoading, error } = useCandidates(page, filters);

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur</div>;

  const candidatesResponse = data as CandidatesResponse | undefined;
  return <div>{candidatesResponse?.items?.[0]?.firstName ?? "Vide"}</div>;
}

describe("useCandidates hook", () => {
  const mockedGetCandidates = candidatesApi.getCandidates as jest.MockedFunction<typeof candidatesApi.getCandidates>;

  beforeEach(() => {
    queryClient.clear();
    mockedGetCandidates.mockReset();
  });

  test("charge les candidats sans filtres", async () => {
    mockedGetCandidates.mockResolvedValueOnce({
      items: [{ _id: "1", firstName: "Jean", lastName: "Dupont", email: "jean@mail.com", phone: "0600000000", status: "pending" }],
      total: 1,
      page: 1,
      pages: 1,
      limit: 10
    });

    renderWithQueryClient(<TestComponent page={1} />);

    await waitFor(() => expect(screen.getByText("Jean")).toBeInTheDocument());
    expect(mockedGetCandidates).toHaveBeenCalledWith(1, { search: undefined, status: undefined });
  });

  test("recharge les candidats avec filtres de recherche et statut", async () => {
    mockedGetCandidates.mockResolvedValueOnce({
      items: [{ _id: "2", firstName: "Marie", lastName: "Curie", email: "marie@mail.com", phone: "0600000001", status: "validated" }],
      total: 1,
      page: 2,
      pages: 2,
      limit: 10
    });

    renderWithQueryClient(<TestComponent page={2} filters={{ search: "Marie", status: "validated" }} />);

    await waitFor(() => expect(screen.getByText("Marie")).toBeInTheDocument());
    expect(mockedGetCandidates).toHaveBeenCalledWith(2, { search: "Marie", status: "validated" });
  });
});
