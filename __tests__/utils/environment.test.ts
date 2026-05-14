import { isProduction } from "@/utils/environment";
import process from "node:process";

describe("isProduction", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalEnv,
      configurable: true,
    });
  });

  it("returns true when NODE_ENV is 'production'", () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      configurable: true,
    });
    expect(isProduction()).toBe(true);
  });

  it("returns false when NODE_ENV is 'development'", () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "development",
      configurable: true,
    });
    expect(isProduction()).toBe(false);
  });

  it("returns false when NODE_ENV is 'test' (current Jest env)", () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "test",
      configurable: true,
    });
    expect(isProduction()).toBe(false);
  });
});
