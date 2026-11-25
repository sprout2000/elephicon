declare global {
  interface Window {
    myAPI: IElectronAPI;
  }
}

export interface IElectronAPI {
  getFilePath: (file: File) => string;

  pngcheck: (filepath: string) => Promise<string | null>;

  mkIco: (filepath: string) => Promise<Result>;

  mkIcns: (filepath: string) => Promise<Result>;

  contextMenu: () => Promise<void>;

  openDialog: () => Promise<string | undefined>;

  menuOpen: (
    listener: (_e: Electron.IpcRendererEvent, filepath: string) => void,
  ) => () => Electron.IpcRenderer;

  setDesktop: (
    listener: (_e: Electron.IpcRendererEvent, arg: boolean) => void,
  ) => () => Electron.IpcRenderer;
}
