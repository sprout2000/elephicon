/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    ipcRenderer: Sandbox;
  }
}

export interface Sandbox {
  invoke(channel: string, ...args: any[]): Promise<any>;
}
