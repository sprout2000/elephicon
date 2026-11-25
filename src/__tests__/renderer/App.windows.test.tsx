import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";

import type { App as AppComponent } from "../../web/App";
import { installMockApi } from "./mockApi";

let App: typeof AppComponent;

// App.tsx は読み込み時に OS を判定するので、プラットフォームを変えてから読み込む
beforeAll(async () => {
  Object.defineProperty(window.navigator, "userAgentData", {
    value: { brands: [], mobile: false, platform: "Windows" },
    configurable: true,
  });

  ({ App } = await import("../../web/App"));
});

describe("App on Windows and Linux", () => {
  it("does not use the drag region class", () => {
    installMockApi();
    render(<App />);

    expect(screen.getByRole("main").className).toBe("container");
  });
});
