import { beforeAll, afterAll } from "vitest";

beforeAll(() => {

});

afterAll(() => {

});


const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("Warning:")) return;
    originalError(...args);
  };
});