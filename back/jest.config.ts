import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.model.ts',
    '!src/server.ts',
    '!src/app.ts'
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};

export default config;
