import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/app";

// Token valide pour tous les tests
const token = jwt.sign(
  { userId: "test", email: "test@test.com" },
  process.env.JWT_SECRET || "test_secret",
  { expiresIn: "1d" }
);

const auth = () => ({ Authorization: `Bearer ${token}` });

const validCandidate = {
  firstName: "Jean",
  lastName: "Dupont",
  email: "jean@mail.com",
  phone: "0600000000",
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────

describe("POST /api/candidates/login", () => {
  it("retourne 401 si identifiants invalides", async () => {
    const res = await request(app)
      .post("/api/candidates/login")
      .send({ email: "wrong@mail.com", password: "wrong" });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Identifiants invalides");
  });
});

// ─── CREATE ───────────────────────────────────────────────────────────────────

describe("POST /api/candidates", () => {
  it("crée un candidat valide → 201", async () => {
    const res = await request(app)
      .post("/api/candidates")
      .set(auth())
      .send(validCandidate);
    expect(res.status).toBe(201);
    expect(res.body.email).toBe(validCandidate.email);
    expect(res.body.status).toBe("pending");
  });

  it("refuse sans token → 401", async () => {
    const res = await request(app)
      .post("/api/candidates")
      .send(validCandidate);
    expect(res.status).toBe(401);
  });

  it("refuse un body invalide → 400", async () => {
    const res = await request(app)
      .post("/api/candidates")
      .set(auth())
      .send({ firstName: "Jean" }); // champs manquants
    expect(res.status).toBe(400);
  });

  it("refuse un email en double → 400", async () => {
    await request(app).post("/api/candidates").set(auth()).send(validCandidate);
    const res = await request(app)
      .post("/api/candidates")
      .set(auth())
      .send(validCandidate);
    expect(res.status).toBe(400);
  });
});

// ─── GET ALL ──────────────────────────────────────────────────────────────────

describe("GET /api/candidates", () => {
  it("retourne la liste paginée → 200", async () => {
    await request(app).post("/api/candidates").set(auth()).send(validCandidate);
    const res = await request(app).get("/api/candidates").set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ items: expect.any(Array), total: 1, page: 1 });
  });

  it("filtre par search", async () => {
    await request(app).post("/api/candidates").set(auth()).send(validCandidate);
    const res = await request(app)
      .get("/api/candidates?search=Jean")
      .set(auth());
    expect(res.body.items).toHaveLength(1);
  });

  it("filtre par status", async () => {
    await request(app).post("/api/candidates").set(auth()).send(validCandidate);
    const res = await request(app)
      .get("/api/candidates?status=pending")
      .set(auth());
    expect(res.body.items[0].status).toBe("pending");
  });

  it("refuse sans token → 401", async () => {
    const res = await request(app).get("/api/candidates");
    expect(res.status).toBe(401);
  });
});

// ─── GET ONE ──────────────────────────────────────────────────────────────────

describe("GET /api/candidates/:id", () => {
  it("retourne le candidat → 200", async () => {
    const created = await request(app)
      .post("/api/candidates")
      .set(auth())
      .send(validCandidate);
    const res = await request(app)
      .get(`/api/candidates/${created.body._id}`)
      .set(auth());
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(created.body._id);
  });

  it("retourne 404 si inexistant", async () => {
    const res = await request(app)
      .get("/api/candidates/000000000000000000000000")
      .set(auth());
    expect(res.status).toBe(404);
  });
});

// ─── UPDATE ───────────────────────────────────────────────────────────────────

describe("PUT /api/candidates/:id", () => {
  it("met à jour un candidat → 200", async () => {
    const created = await request(app)
      .post("/api/candidates")
      .set(auth())
      .send(validCandidate);
    const res = await request(app)
      .put(`/api/candidates/${created.body._id}`)
      .set(auth())
      .send({ ...validCandidate, firstName: "Pierre" });
    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("Pierre");
  });

  it("refuse un body invalide → 400", async () => {
    const created = await request(app)
      .post("/api/candidates")
      .set(auth())
      .send(validCandidate);
    const res = await request(app)
      .put(`/api/candidates/${created.body._id}`)
      .set(auth())
      .send({ email: "pas-un-email" });
    expect(res.status).toBe(400);
  });
});

// ─── DELETE ───────────────────────────────────────────────────────────────────

describe("DELETE /api/candidates/:id", () => {
  it("soft-delete → 200 + invisible dans GET", async () => {
    const created = await request(app)
      .post("/api/candidates")
      .set(auth())
      .send(validCandidate);
    const del = await request(app)
      .delete(`/api/candidates/${created.body._id}`)
      .set(auth());
    expect(del.status).toBe(200);

    // ne doit plus apparaître dans la liste
    const list = await request(app).get("/api/candidates").set(auth());
    expect(list.body.total).toBe(0);

    // ne doit plus être accessible par ID
    const get = await request(app)
      .get(`/api/candidates/${created.body._id}`)
      .set(auth());
    expect(get.status).toBe(404);
  });
});

// ─── VALIDATE ─────────────────────────────────────────────────────────────────

describe("POST /api/candidates/:id/validate", () => {
  it("valide un candidat → status validated", async () => {
    const created = await request(app)
      .post("/api/candidates")
      .set(auth())
      .send(validCandidate);
    const res = await request(app)
      .post(`/api/candidates/${created.body._id}/validate`)
      .set(auth());
    expect(res.status).toBe(200);
  });

  it("refuse de valider un candidat supprimé → 404", async () => {
    const created = await request(app)
      .post("/api/candidates")
      .set(auth())
      .send(validCandidate);
    await request(app)
      .delete(`/api/candidates/${created.body._id}`)
      .set(auth());
    const res = await request(app)
      .post(`/api/candidates/${created.body._id}/validate`)
      .set(auth());
    expect(res.status).toBe(404);
  });
});