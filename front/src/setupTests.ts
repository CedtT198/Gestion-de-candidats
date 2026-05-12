import "@testing-library/jest-dom";
import { toHaveNoViolations } from "jest-axe";
declare const require: any;
const { TextEncoder, TextDecoder } =
  typeof require === "function" ? require("util") : (globalThis as any);
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
