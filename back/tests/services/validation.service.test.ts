import { asyncValidation } from "../../src/services/validation.service";

describe("asyncValidation service", () => {
  it("resolves with validation result", async () => {
    const result = await asyncValidation();

    expect(result).toEqual({
      valid: true,
      message: "Validation terminée"
    });
  });
});
