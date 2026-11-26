import { vi } from "vitest";

import type { DragDropHandlers } from "../web/api";

/** The listeners App registered, so that tests can send events to it. */
export const listeners: {
  menuOpen?: (path: string) => void;
  dragDrop?: DragDropHandlers;
} = {};

export const unlisten = {
  menuOpen: vi.fn(),
  dragDrop: vi.fn(),
};

/** Replaces `api` from src/web/api.ts in the tests. */
export const mockApi = {
  checkImage: vi.fn<(path: string) => Promise<string | null>>(),
  makeIco: vi.fn<(path: string) => Promise<Result>>(),
  makeIcns: vi.fn<(path: string) => Promise<Result>>(),
  openDialog: vi.fn<() => Promise<string | null>>(),
  contextMenu: vi.fn<(x: number, y: number) => Promise<void>>(),
  onMenuOpen: vi.fn((listener: (path: string) => void) => {
    listeners.menuOpen = listener;
    return Promise.resolve(unlisten.menuOpen);
  }),
  onDragDrop: vi.fn((handlers: DragDropHandlers) => {
    listeners.dragDrop = handlers;
    return Promise.resolve(unlisten.dragDrop);
  }),
};

/** Sets the default answers: a supported image that converts without errors. */
export const resetMockApi = () => {
  listeners.menuOpen = undefined;
  listeners.dragDrop = undefined;

  mockApi.checkImage.mockResolvedValue(null);
  mockApi.makeIco.mockResolvedValue({
    type: "success",
    log: "icon.ico",
    desktop: true,
  });
  mockApi.makeIcns.mockResolvedValue({
    type: "success",
    log: "icon.icns",
    desktop: true,
  });
  mockApi.openDialog.mockResolvedValue(null);
  mockApi.contextMenu.mockResolvedValue(undefined);
};
