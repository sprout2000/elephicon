import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library は Vitest の globals を使うときだけこの印を付けるので、ここで付ける
// https://react.dev/reference/react/act
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  cleanup();
});
