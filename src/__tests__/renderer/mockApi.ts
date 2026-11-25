import { vi } from "vitest";

import type { IElectronAPI } from "../../@types/Context";

type Listener<T> = (e: Electron.IpcRendererEvent, arg: T) => void;

/** window.myAPI の代わりに使うモックを作り、window に設定する */
export const installMockApi = () => {
  const listeners: {
    menuOpen?: Listener<string>;
    setDesktop?: Listener<boolean>;
  } = {};

  const api = {
    getFilePath: vi.fn((file: File) => `/Users/me/${file.name}`),
    pngcheck: vi.fn(async (_filepath: string): Promise<string | null> => null),
    mkIco: vi.fn(
      async (_filepath: string): Promise<Result> => ({
        type: "success",
        log: "icon.ico",
        desktop: true,
      }),
    ),
    mkIcns: vi.fn(
      async (_filepath: string): Promise<Result> => ({
        type: "success",
        log: "icon.icns",
        desktop: true,
      }),
    ),
    contextMenu: vi.fn(async () => {}),
    openDialog: vi.fn(async (): Promise<string | undefined> => undefined),
    menuOpen: vi.fn((listener: Listener<string>) => {
      listeners.menuOpen = listener;
      return vi.fn();
    }),
    setDesktop: vi.fn((listener: Listener<boolean>) => {
      listeners.setDesktop = listener;
      return vi.fn();
    }),
  };

  window.myAPI = api as unknown as IElectronAPI;

  return { api, listeners };
};

export const ipcEvent = {} as Electron.IpcRendererEvent;
