declare global {
  interface Window {
    myAPI: IElectronAPI;
  }
}

export interface IElectronAPI {
  mimecheck: (filepath: string) => Promise<string | false>;

  mkIco: (filepath: string) => Promise<Result>;

  mkIcns: (filepath: string) => Promise<Result>;

  contextMenu: () => void;

  openDialog: () => Promise<string | void>;

  menuOpen: (
    listener: (_e: Electron.IpcRendererEvent, filepath: string) => void
  ) => Electron.IpcRenderer;
  removeMenuOpen: () => Electron.IpcRenderer;

  setDesktop: (
    listener: (_e: Electron.IpcRendererEvent, arg: boolean) => void
  ) => Electron.IpcRenderer;
  removeSetDesktop: () => Electron.IpcRenderer;
}
