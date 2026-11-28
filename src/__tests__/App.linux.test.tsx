import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { App as AppComponent } from "../web/App";
import { menuModel } from "./menuModel";
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
  mockApi.getContextMenu.mockResolvedValue(menuModel);
});

const rightClick = () =>
  act(async () => {
    fireEvent.contextMenu(screen.getByRole("main"), {
      clientX: 30,
      clientY: 40,
    });
  });

describe("App on Linux", () => {
  it("draws the context menu in the window", async () => {
    render(<App />);

    await rightClick();

    const menu = screen.getByRole("menu", { name: "Menu" });
    expect(menu.style.left).toBe("30px");
    expect(menu.style.top).toBe("40px");
    expect(mockApi.contextMenu).not.toHaveBeenCalled();
  });

  it("runs the chosen item and closes the menu", async () => {
    render(<App />);

    await rightClick();
    fireEvent.click(screen.getByRole("menuitem", { name: /Settings/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Quality/ }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: /Low/ }));

    expect(mockApi.runMenuAction).toHaveBeenCalledWith("quality-low");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("closes the menu with Escape", async () => {
    render(<App />);

    await rightClick();
    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("menu")).toBeNull();
    expect(mockApi.runMenuAction).not.toHaveBeenCalled();
  });

  it("shows no menu when it cannot be loaded", async () => {
    mockApi.getContextMenu.mockRejectedValueOnce("failed");
    render(<App />);

    await rightClick();

    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("opens a file with Ctrl+O", async () => {
    render(<App />);

    fireEvent.keyDown(window, { key: "o", ctrlKey: true });

    await vi.waitFor(() => expect(mockApi.openDialog).toHaveBeenCalled());
  });

  it("does not use a drag region", () => {
    render(<App />);

    expect(
      screen.getByRole("main").hasAttribute("data-tauri-drag-region"),
    ).toBe(false);
  });
});
