import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWebview } from "@tauri-apps/api/webview";

export type DragDropHandlers = {
  /** A file is dragged over the window. */
  onEnter: () => void;
  /** The drag left the window, or the file was dropped. */
  onLeave: () => void;
  /** The path of the first dropped file. */
  onDrop: (path: string) => void;
};

/** The commands and events of the Rust side (src-tauri/src). */
export const api = {
  /** Returns null for a supported image, or the error message to show. */
  checkImage: (path: string) => invoke<string | null>("check_image", { path }),

  makeIco: (path: string) => invoke<Result>("make_ico", { path }),

  makeIcns: (path: string) => invoke<Result>("make_icns", { path }),

  /** Returns the chosen path, or null when the dialog is canceled. */
  openDialog: () => invoke<string | null>("open_file_dialog"),

  /** Shows the menu at the clicked position in the window (CSS pixels). */
  contextMenu: (x: number, y: number) =>
    invoke<void>("show_context_menu", { x, y }),

  /** Listens for files chosen from File > Open. */
  onMenuOpen: (listener: (path: string) => void): Promise<UnlistenFn> =>
    listen<string>("menu-open", (event) => listener(event.payload)),

  /** Listens for files dragged onto the window. */
  onDragDrop: (handlers: DragDropHandlers): Promise<UnlistenFn> =>
    getCurrentWebview().onDragDropEvent((event) => {
      const payload = event.payload;

      if (payload.type === "enter" || payload.type === "over") {
        handlers.onEnter();
      } else if (payload.type === "leave") {
        handlers.onLeave();
      } else {
        handlers.onLeave();
        if (payload.paths[0]) handlers.onDrop(payload.paths[0]);
      }
    }),
};
