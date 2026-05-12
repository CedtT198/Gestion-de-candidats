import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { MemoryRouter } from "react-router-dom";
import CandidateList from "../components/CandidateList";
import { useCandidates } from "../hooks/useCandidates";

jest.mock("../hooks/useCandidates");

const mockedUseCandidates = useCandidates as jest.Mock;

test("accessibilité CandidateList", async () => {
  mockedUseCandidates.mockReturnValue({
    data: {
      items: [
        {
          _id: "1",
          firstName: "Jean",
          lastName: "Dupont",
          email: "jean@mail.com",
          phone: "0600000000",
          status: "pending",
        },
      ],
      total: 1,
      page: 1,
      pages: 1,
      limit: 10,
    },

    isLoading: false,
    isError: false,
    error: null,
  });

  const { container } = render(
    <MemoryRouter>
      <CandidateList />
    </MemoryRouter>
  );

  const results = await axe(container);

  expect(results).toHaveNoViolations();
});