import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { App as AppComponent } from "../web/App";
import { mockApi, resetMockApi } from "./mockApi";

vi.mock("../web/api", async () => {
  const { mockApi } = await import("./mockApi");
  return { api: mockApi };
});

let App: typeof AppComponent;

// platform.ts は読み込み時に OS を判定するので、Linux にしてから読み込む
beforeAll(async () => {
  Object.defineProperty(window.navigator, "userAgent", {
    value: "Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/605.1.15",
    configurable: true,
  });

  ({ App } = await import("../web/App"));
});

beforeEach(() => {
  resetMockApi();
});

describe("App on Linux", () => {
  it("has no context menu, not even the default one", () => {
    render(<App />);

    const event = fireEvent.contextMenu(screen.getByRole("main"), {
      clientX: 30,
      clientY: 40,
    });

    // fireEvent returns false when preventDefault was called
    expect(event).toBe(false);
    expect(mockApi.contextMenu).not.toHaveBeenCalled();
  });

  it("leaves Ctrl+O to the menu bar", () => {
    render(<App />);

    fireEvent.keyDown(window, { key: "o", ctrlKey: true });

    expect(mockApi.openDialog).not.toHaveBeenCalled();
  });

  it("does not use a drag region", () => {
    render(<App />);

    expect(
      screen.getByRole("main").hasAttribute("data-tauri-drag-region"),
    ).toBe(false);
  });
});
