/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    ipcRenderer: Sandbox;
  }
}

export interface Sandbox {
  invoke(channel: string, ...args: any[]): Promise<any>;
  on(
    channel: string,
    listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ): void;
  removeAllListeners(channel: string): void;
}
