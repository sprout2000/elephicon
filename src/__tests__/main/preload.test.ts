import { beforeAll, describe, expect, it, vi } from "vitest";

import type { IElectronAPI } from "../../@types/Context";

const mocks = vi.hoisted(() => ({
  exposeInMainWorld: vi.fn(),
  invoke: vi.fn(),
  on: vi.fn(),
  removeAllListeners: vi.fn(),
  getPathForFile: vi.fn(),
}));

vi.mock("electron", () => ({
  contextBridge: { exposeInMainWorld: mocks.exposeInMainWorld },
  ipcRenderer: {
    invoke: mocks.invoke,
    on: mocks.on,
    removeAllListeners: mocks.removeAllListeners,
  },
  webUtils: { getPathForFile: mocks.getPathForFile },
}));

let api: IElectronAPI;

beforeAll(async () => {
  await import("../../preload");
  api = mocks.exposeInMainWorld.mock.calls[0][1] as IElectronAPI;
});

describe("preload", () => {
  it("exposes the API as window.myAPI", () => {
    expect(mocks.exposeInMainWorld).toHaveBeenCalledTimes(1);
    expect(mocks.exposeInMainWorld.mock.calls[0][0]).toBe("myAPI");
  });

  it.each([
    ["pngcheck", "png-check"],
    ["mkIco", "make-ico"],
    ["mkIcns", "make-icns"],
  ] as const)("%s invokes %s with the file path", async (name, channel) => {
    mocks.invoke.mockResolvedValueOnce("result");

    await expect(api[name]("/path/icon.png")).resolves.toBe("result");
    expect(mocks.invoke).toHaveBeenLastCalledWith(channel, "/path/icon.png");
  });

  it("contextMenu invokes show-context-menu", async () => {
    await api.contextMenu();
    expect(mocks.invoke).toHaveBeenLastCalledWith("show-context-menu");
  });

  it("openDialog invokes open-file-dialog", async () => {
    mocks.invoke.mockResolvedValueOnce("/path/icon.png");

    await expect(api.openDialog()).resolves.toBe("/path/icon.png");
    expect(mocks.invoke).toHaveBeenLastCalledWith("open-file-dialog");
  });

  it("getFilePath uses webUtils.getPathForFile", () => {
    mocks.getPathForFile.mockReturnValueOnce("/path/icon.png");
    const file = new File([], "icon.png");

    expect(api.getFilePath(file)).toBe("/path/icon.png");
    expect(mocks.getPathForFile).toHaveBeenCalledWith(file);
  });

  it.each([
    ["menuOpen", "menu-open"],
    ["setDesktop", "set-desktop"],
  ] as const)("%s listens to %s and can stop listening", (name, channel) => {
    const listener = vi.fn();

    const unlisten = api[name](listener);
    expect(mocks.on).toHaveBeenLastCalledWith(channel, listener);

    unlisten();
    expect(mocks.removeAllListeners).toHaveBeenLastCalledWith(channel);
  });
});
