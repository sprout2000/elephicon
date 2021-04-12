import { contextBridge, ipcRenderer } from 'electron';
import { Result } from './lib/Result';

contextBridge.exposeInMainWorld('myAPI', {
  mimecheck: async (filepath: string): Promise<string | false> =>
    await ipcRenderer.invoke('mime-check', filepath),

  mkIco: async (filepath: string): Promise<Result> =>
    await ipcRenderer.invoke('make-ico', filepath),

  mkIcns: async (filepath: string): Promise<Result> =>
    await ipcRenderer.invoke('make-icns', filepath),

  openDialog: async (): Promise<string | void> =>
    await ipcRenderer.invoke('open-file-dialog'),

  menuOpen: (
    listener: (_e: Electron.IpcRendererEvent, filepath: string) => Promise<void>
  ) => ipcRenderer.on('menu-open', listener),
  removeMenuOpen: () => ipcRenderer.removeAllListeners('menu-open'),

  setDesktop: (
    listener: (_e: Electron.IpcRendererEvent, arg: boolean) => void
  ) => ipcRenderer.on('set-desktop', listener),
  removeSetDesktop: () => ipcRenderer.removeAllListeners('set-desktop'),
});
