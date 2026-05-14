/**
 * Jest configuration for the SoPra FS26 Group 43 client.
 *
 * Uses ts-jest for TypeScript transformation and jsdom for DOM-based
 * tests of hooks, services, types, and small components. CSS-module
 * imports are stubbed so component tests do not need a CSS bundler.
 *
 * Tests live under __tests__/ at the repo root. They are independent
 * of the Next.js server and do not require a running backend.
 */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/__tests__/**/*.test.{ts,tsx}"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/app/$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js",
  },
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          esModuleInterop: true,
          module: "commonjs",
          target: "ES2017",
          moduleResolution: "node",
          allowJs: true,
          strict: true,
          skipLibCheck: true,
        },
      },
    ],
  },
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "!app/**/*.d.ts",
    "!app/**/layout.tsx",
  ],
};
