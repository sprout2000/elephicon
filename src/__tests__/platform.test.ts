import { afterEach, describe, expect, it, vi } from "vitest";

const setUserAgent = (userAgent: string) => {
  Object.defineProperty(window.navigator, "userAgent", {
    value: userAgent,
    configurable: true,
  });
};

// platform.ts は読み込み時に OS を判定するので、毎回読み込み直す
const load = async (userAgent: string) => {
  setUserAgent(userAgent);
  vi.resetModules();
  return import("../web/platform");
};

afterEach(() => {
  // 定義し直した userAgent を消し、jsdom の値に戻す
  Reflect.deleteProperty(window.navigator, "userAgent");
});

describe("platform", () => {
  it("detects macOS and moves the window by its content", async () => {
    const platform = await load(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
    );

    expect(platform.isDarwin).toBe(true);
    expect(platform.dragRegion).toEqual({ "data-tauri-drag-region": true });
  });

  it.each([
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Edg/131.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/605.1.15",
  ])("does not use a drag region on %s", async (userAgent) => {
    const platform = await load(userAgent);

    expect(platform.isDarwin).toBe(false);
    expect(platform.dragRegion).toEqual({});
  });
});
