import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import type { App as AppComponent } from "../web/App";
import { mockApi, resetMockApi } from "./mockApi";

vi.mock("../web/api", async () => {
  const { mockApi } = await import("./mockApi");
  return { api: mockApi };
});

let App: typeof AppComponent;

// platform.ts は読み込み時に OS を判定するので、macOS にしてから読み込む
beforeAll(async () => {
  Object.defineProperty(window.navigator, "userAgent", {
    value:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
    configurable: true,
  });
  resetMockApi();

  ({ App } = await import("../web/App"));
});

describe("App on macOS", () => {
  it("moves the window by its content", () => {
    render(<App />);

    expect(
      screen.getByRole("main").hasAttribute("data-tauri-drag-region"),
    ).toBe(true);
    expect(
      screen
        .getByRole("region", { name: "Drop zone" })
        .hasAttribute("data-tauri-drag-region"),
    ).toBe(true);
  });

  it("leaves Cmd+O to the app menu", () => {
    render(<App />);

    fireEvent.keyDown(window, { key: "o", ctrlKey: true });

    expect(mockApi.openDialog).not.toHaveBeenCalled();
  });
});
