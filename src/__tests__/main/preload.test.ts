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
let exposedName: unknown;
let exposedTimes: number;

// 各テストの前にモックの呼び出し記録が消されるので、読み込み直後の値を取っておく
beforeAll(async () => {
  await import("../../preload");

  const { calls } = mocks.exposeInMainWorld.mock;
  exposedTimes = calls.length;
  exposedName = calls[0][0];
  api = calls[0][1] as IElectronAPI;
});

describe("preload", () => {
  it("exposes the API as window.myAPI", () => {
    expect(exposedTimes).toBe(1);
    expect(exposedName).toBe("myAPI");
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
