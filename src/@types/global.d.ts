import { Result } from '../lib/Result';

declare global {
  interface Window {
    myAPI: Sandbox;
  }
}

export interface Sandbox {
  mimecheck: (filepath: string) => Promise<string | false>;

  mkIco: (filepath: string) => Promise<Result>;

  mkIcns: (filepath: string) => Promise<Result>;

  contextMenu: () => void;

  openDialog: () => Promise<string | void>;

  menuOpen: (
    listener: (_e: Electron.IpcRendererEvent, filepath: string) => Promise<void>
  ) => Electron.IpcRenderer;
  removeMenuOpen: () => Electron.IpcRenderer;

  setDesktop: (
    listener: (_e: Electron.IpcRendererEvent, arg: boolean) => void
  ) => Electron.IpcRenderer;
  removeDesktop: () => Electron.IpcRenderer;
}
