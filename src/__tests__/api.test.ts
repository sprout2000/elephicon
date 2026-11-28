import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "../web/api";

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  listen: vi.fn(),
  onDragDropEvent: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => ({ invoke: mocks.invoke }));
vi.mock("@tauri-apps/api/event", () => ({ listen: mocks.listen }));
vi.mock("@tauri-apps/api/webview", () => ({
  getCurrentWebview: () => ({ onDragDropEvent: mocks.onDragDropEvent }),
}));

type DragDropPayload =
  | { type: "enter" | "drop"; paths: string[] }
  | { type: "over" }
  | { type: "leave" };

const handlers = () => ({
  onEnter: vi.fn(),
  onLeave: vi.fn(),
  onDrop: vi.fn(),
});

/** Registers the handlers and returns a function that sends Tauri events. */
const listenDragDrop = (h: ReturnType<typeof handlers>) => {
  api.onDragDrop(h);
  const listener = mocks.onDragDropEvent.mock.calls[0][0] as (event: {
    payload: DragDropPayload;
  }) => void;

  return (payload: DragDropPayload) => listener({ payload });
};

beforeEach(() => {
  mocks.invoke.mockReset();
  mocks.listen.mockReset();
  mocks.onDragDropEvent.mockReset();
});

describe("api commands", () => {
  it.each([
    ["checkImage", "check_image"],
    ["makeIco", "make_ico"],
    ["makeIcns", "make_icns"],
  ] as const)("%s invokes %s with the path", async (name, command) => {
    mocks.invoke.mockResolvedValueOnce("result");

    await expect(api[name]("/Users/me/icon.png")).resolves.toBe("result");
    expect(mocks.invoke).toHaveBeenCalledWith(command, {
      path: "/Users/me/icon.png",
    });
  });

  it("openDialog invokes open_file_dialog", async () => {
    mocks.invoke.mockResolvedValueOnce("/Users/me/icon.png");

    await expect(api.openDialog()).resolves.toBe("/Users/me/icon.png");
    expect(mocks.invoke).toHaveBeenCalledWith("open_file_dialog");
  });

  it("contextMenu invokes show_context_menu with the position", async () => {
    mocks.invoke.mockResolvedValueOnce(undefined);

    await api.contextMenu(120, 80);

    expect(mocks.invoke).toHaveBeenCalledWith("show_context_menu", {
      x: 120,
      y: 80,
    });
  });
});

describe("api context menu for Linux", () => {
  it("getContextMenu invokes get_context_menu", async () => {
    const model = [{ type: "separator" }];
    mocks.invoke.mockResolvedValueOnce(model);

    await expect(api.getContextMenu()).resolves.toBe(model);
    expect(mocks.invoke).toHaveBeenCalledWith("get_context_menu");
  });

  it("runMenuAction invokes run_menu_action with the id", async () => {
    mocks.invoke.mockResolvedValueOnce(undefined);

    await api.runMenuAction("quality-low");

    expect(mocks.invoke).toHaveBeenCalledWith("run_menu_action", {
      id: "quality-low",
    });
  });
});

describe("api events", () => {
  it("onMenuOpen listens to menu-open and passes the path", async () => {
    const stop = vi.fn();
    mocks.listen.mockResolvedValueOnce(stop);
    const listener = vi.fn();

    await expect(api.onMenuOpen(listener)).resolves.toBe(stop);

    const [event, callback] = mocks.listen.mock.calls[0];
    expect(event).toBe("menu-open");
    callback({ payload: "/Users/me/icon.png" });
    expect(listener).toHaveBeenCalledWith("/Users/me/icon.png");
  });

  it("onDragDrop returns the function that stops listening", async () => {
    const stop = vi.fn();
    mocks.onDragDropEvent.mockResolvedValueOnce(stop);

    await expect(api.onDragDrop(handlers())).resolves.toBe(stop);
  });

  it("treats enter and over as dragging", () => {
    const h = handlers();
    const send = listenDragDrop(h);

    send({ type: "enter", paths: ["/Users/me/icon.png"] });
    send({ type: "over" });

    expect(h.onEnter).toHaveBeenCalledTimes(2);
    expect(h.onLeave).not.toHaveBeenCalled();
  });

  it("treats leave as the end of dragging", () => {
    const h = handlers();
    const send = listenDragDrop(h);

    send({ type: "leave" });

    expect(h.onLeave).toHaveBeenCalledTimes(1);
    expect(h.onDrop).not.toHaveBeenCalled();
  });

  it("passes only the first dropped file", () => {
    const h = handlers();
    const send = listenDragDrop(h);

    send({ type: "drop", paths: ["/Users/me/a.png", "/Users/me/b.png"] });

    expect(h.onLeave).toHaveBeenCalledTimes(1);
    expect(h.onDrop).toHaveBeenCalledWith("/Users/me/a.png");
  });

  it("ignores a drop without files", () => {
    const h = handlers();
    const send = listenDragDrop(h);

    send({ type: "drop", paths: [] });

    expect(h.onLeave).toHaveBeenCalledTimes(1);
    expect(h.onDrop).not.toHaveBeenCalled();
  });
});
