import "@testing-library/jest-dom";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { TextEncoder, TextDecoder } from "util";
import { server } from "./test/mswServer";

expect.extend(toHaveNoViolations);

if (typeof (globalThis as any).TextEncoder === "undefined") {
  (globalThis as any).TextEncoder = TextEncoder;
}
if (typeof (globalThis as any).TextDecoder === "undefined") {
  (globalThis as any).TextDecoder = TextDecoder;
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
