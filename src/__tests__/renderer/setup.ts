import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom には navigator.userAgentData がないので、App.tsx の読み込み前に用意する
Object.defineProperty(window.navigator, "userAgentData", {
  value: { brands: [], mobile: false, platform: "macOS" },
  configurable: true,
});

afterEach(() => {
  cleanup();
});
