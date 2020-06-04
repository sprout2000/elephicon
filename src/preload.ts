import { contextBridge, ipcRenderer } from 'electron';
import { Result } from '../src/result';

contextBridge.exposeInMainWorld('myAPI', {
  mimecheck: async (filepath: string): Promise<string | false> =>
    await ipcRenderer.invoke('mime-check', filepath),

  mkIcns: async (filepath: string): Promise<Result> =>
    await ipcRenderer.invoke('make-icns', filepath),

  mkIco: async (filepath: string): Promise<Result> =>
    await ipcRenderer.invoke('make-ico', filepath),

  openDialog: async (): Promise<string | void> =>
    ipcRenderer.invoke('open-file-dialog'),

  closeWindow: (): void => ipcRenderer.send('close-window'),

  openContextMenu: (): void => ipcRenderer.send('open-contextmenu'),

  onDrop: (listener: (_e: Event, filepath: string) => Promise<void>) =>
    ipcRenderer.on('dropped', listener),

  removeOnDrop: () => ipcRenderer.removeAllListeners('dropped'),

  menuOpen: (
    listener: (_e: Electron.IpcRendererEvent, filepath: string) => Promise<void>
  ) => ipcRenderer.on('menu-open', listener),
  removeMenuOpen: () => ipcRenderer.removeAllListeners('menu-open'),

  changeState: (arg: boolean) => ipcRenderer.send('change-state', arg),

  setState: (listener: (_e: Electron.IpcRendererEvent, arg: boolean) => void) =>
    ipcRenderer.once('set-state', listener),
  removeSetState: () => ipcRenderer.removeAllListeners('set-state'),

  getOS: (listener: (_e: Electron.IpcRendererEvent, arg: boolean) => void) =>
    ipcRenderer.once('platform', listener),
  removeGetOS: () => ipcRenderer.removeAllListeners('platform'),
});
