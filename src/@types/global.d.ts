import { Result } from '../lib/Result';

type Brand = {
  readonly brand: string;
  readonly version: string;
};

type NavigatorUAData = {
  readonly brands: Brand[];
  readonly mobile: boolean;
  readonly platform: string;
};

declare global {
  interface Window {
    myAPI: Sandbox;
  }
  interface Navigator {
    userAgentData: NavigatorUAData;
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
