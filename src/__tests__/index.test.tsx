import { act, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { resetMockApi } from "./mockApi";

vi.mock("../web/api", async () => {
  const { mockApi } = await import("./mockApi");
  return { api: mockApi };
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("index", () => {
  it("renders the app into #root", async () => {
    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);
    resetMockApi();

    await act(async () => {
      await import("../web/index");
    });

    expect(root.contains(screen.getByText("Drop your PNGs here..."))).toBe(
      true,
    );
  });

  it("fails when #root is missing", async () => {
    vi.resetModules();

    await expect(import("../web/index")).rejects.toThrow();
  });
});
