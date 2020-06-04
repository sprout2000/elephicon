import { Result } from '../src/result';

declare global {
  interface Window {
    myAPI: Sandbox;
  }
}

export interface Sandbox {
  platform: () => Promise<boolean>;

  mimecheck: (filepath: string) => Promise<string | false>;

  mkIcns: (filepath: string) => Promise<Result>;

  mkIco: (filepath: string) => Promise<Result>;

  openDialog: () => Promise<string | void>;

  closeWindow: () => void;

  openContextMenu: () => void;

  onDrop: (
    listener: (_e: Event, filepath: string) => Promise<void>
  ) => Electron.IpcRenderer;
  removeOnDrop: () => Electron.IpcRenderer;

  menuOpen: (
    listener: (_e: Electron.IpcRendererEvent, filepath: string) => Promise<void>
  ) => Electron.IpcRenderer;
  removeMenuOpen: () => Electron.IpcRenderer;

  changeState: (arg: boolean) => void;

  setState: (
    listener: (_e: Electron.IpcRendererEvent, arg: boolean) => void
  ) => Electron.IpcRenderer;
  removeSetState: () => Electron.IpcRenderer;
}
