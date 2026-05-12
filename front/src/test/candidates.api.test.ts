import { buildQueryParams } from "../api/candidates.api";

describe("buildQueryParams utilitaire", () => {
  test("génère une query string avec tous les paramètres valides", () => {
    const query = buildQueryParams({ page: 2, limit: 25, search: "Jean", status: "pending" });

    expect(query).toBe("page=2&limit=25&search=Jean&status=pending");
  });

  test("ignore les paramètres vides ou indéfinis", () => {
    const query = buildQueryParams({ page: 1, limit: undefined, search: "", status: undefined });

    expect(query).toBe("page=1");
  });
});
