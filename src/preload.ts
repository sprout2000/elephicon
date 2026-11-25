import { contextBridge, ipcRenderer, webUtils } from "electron";

contextBridge.exposeInMainWorld("myAPI", {
  getFilePath: (file: File) => webUtils.getPathForFile(file),

  pngcheck: async (filepath: string): Promise<string | null> =>
    ipcRenderer.invoke("png-check", filepath),

  mkIco: async (filepath: string): Promise<Result> =>
    ipcRenderer.invoke("make-ico", filepath),

  mkIcns: async (filepath: string): Promise<Result> =>
    ipcRenderer.invoke("make-icns", filepath),

  contextMenu: (): Promise<void> => ipcRenderer.invoke("show-context-menu"),

  openDialog: async (): Promise<string | undefined> =>
    ipcRenderer.invoke("open-file-dialog"),

  menuOpen: (
    listener: (_e: Electron.IpcRendererEvent, filepath: string) => void,
  ) => {
    ipcRenderer.on("menu-open", listener);
    return () => ipcRenderer.removeAllListeners("menu-open");
  },

  setDesktop: (
    listener: (_e: Electron.IpcRendererEvent, arg: boolean) => void,
  ) => {
    ipcRenderer.on("set-desktop", listener);
    return () => ipcRenderer.removeAllListeners("set-desktop");
  },
});
