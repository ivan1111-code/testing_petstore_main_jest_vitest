/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  testTimeout: 15000,
  setupFilesAfterEnv: ["<rootDir>/tests/support/jest.setup.js"],
  verbose: true,
  maxWorkers: 1,
  reporters: ["default"],
};