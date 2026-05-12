import Candidate from "../../src/models/candidate.model";

describe("Candidate model", () => {
  it("has the defined schema fields", () => {
    const paths = Candidate.schema.paths;

    expect(paths.firstName.options.required).toBe(true);
    expect(paths.lastName.options.required).toBe(true);
    expect(paths.email.options.required).toBe(true);
    expect(paths.email.options.unique).toBe(true);
    expect(paths.phone.options.required).toBe(true);
    expect(paths.status.options.default).toBe("pending");
    expect(paths.deletedAt.options.default).toBeNull();
    expect(Candidate.schema.options.timestamps).toBe(true);
  });

  it("creates a document instance with default values", () => {
    const candidate = new Candidate({
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean.dupont@mail.com",
      phone: "0123456789"
    });

    expect(candidate.firstName).toBe("Jean");
    expect(candidate.lastName).toBe("Dupont");
    expect(candidate.email).toBe("jean.dupont@mail.com");
    expect(candidate.phone).toBe("0123456789");
    expect(candidate.status).toBe("pending");
    expect(candidate.deletedAt).toBeNull();
  });

  it("uses the correct model name", () => {
    expect(Candidate.modelName).toBe("Candidate");
  });
});
