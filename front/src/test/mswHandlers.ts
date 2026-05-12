import { rest } from "msw";

const sampleCandidates = [
  {
    _id: "1",
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean@mail.com",
    phone: "0600000000",
    status: "pending"
  },
  {
    _id: "2",
    firstName: "Marie",
    lastName: "Curie",
    email: "marie@mail.com",
    phone: "0600000001",
    status: "validated"
  }
];

export const handlers = [
  rest.get("http://localhost:3000/api/candidates", (req, res, ctx) => {
    const search = req.url.searchParams.get("search")?.toLowerCase() || "";
    const status = req.url.searchParams.get("status") || "";

    const items = sampleCandidates.filter((candidate) => {
      const matchesSearch =
        !search ||
        [candidate.firstName, candidate.lastName, candidate.email, candidate.phone]
          .some((field) => field.toLowerCase().includes(search));
      const matchesStatus = !status || candidate.status === status;
      return matchesSearch && matchesStatus;
    });

    return res(
      ctx.status(200),
      ctx.json({
        items,
        total: items.length,
        page: Number(req.url.searchParams.get("page") || 1),
        pages: 1,
        limit: Number(req.url.searchParams.get("limit") || 10)
      })
    );
  }),

  rest.get("http://localhost:3000/api/candidates/:id", (req, res, ctx) => {
    const { id } = req.params;
    const candidate = sampleCandidates.find((candidate) => candidate._id === id);
    if (!candidate) {
      return res(ctx.status(404), ctx.json({ message: "Candidat introuvable" }));
    }
    return res(ctx.status(200), ctx.json(candidate));
  }),

  rest.post("http://localhost:3000/api/candidates/login", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: "Connexion réussie", token: "fake-token" }));
  })
];
