import fs from "fs";
import type { Config } from "@jest/types";

const projects: any = fs
    .readdirSync("./packages", { withFileTypes: true })
    .filter((directory) => directory.isDirectory())
    .map(({ name }) => ({
        rootDir: `packages/${name}`,
        displayName: name,
        moduleNameMapper: {
            "@cryptkeeper/(.*)": "<rootDir>/../$1/src/index.ts" // Interdependency packages.
        }
    }))

export default async (): Promise<Config.InitialOptions> => ({
  projects,
  testTimeout: 10000,
  transform: {
    "\\.(ts|tsx)": "ts-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/packages/jest/src/index.ts"],
  testMatch: ["**/src/**/__tests__/**/*.[jt]s?(x)", "**/src/**/?(*.)+(spec|test).[jt]s?(x)"],
  moduleFileExtensions: ["ts", "js", "tsx"],
  moduleNameMapper: {
    "^.+\\.(css|scss|svg|png)$": "<rootDir>/packages/mocks/src/resourceMock.js",
    nanoid: "<rootDir>/packages/mocks/src/nanoidMock.js",
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/packages/**/node_modules/",
    "/test/",
    "/__tests__/",
    "/packages/e2e/**/*.{ts,tsx}",
    "/packages/server/",
    "/packages/demo/src/ui/popup.tsx",
    "/packages/ui/src/theme.ts",
    "/packages/extension/src/backgroundPage.ts",
    "/packages/extension/src/appInit.ts",
  ],
  coverageReporters: ["clover", "lcov", "json", "json-summary", "text", "text-summary"],
  collectCoverageFrom: ["packages/**/*.{ts,tsx}"],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
});
