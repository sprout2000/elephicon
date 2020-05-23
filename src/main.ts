import { BrowserWindow, app, ipcMain, dialog, Menu } from 'electron';
import loadDevtool from 'electron-load-devtool';
import Store from 'electron-store';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

import path from 'path';
import mime from 'mime-types';

import { mkico, mkicns } from './mkicons';
import { successDarwin, successWin32 } from './dialog';
import { TypedStore } from './store';
import createMenu from './menu';

console.log = log.log;
autoUpdater.logger = log;
log.info('App starting...');

process.once('uncaughtException', (err) => {
  log.error('electron:uncaughtException');
  log.error(err.name);
  log.error(err.message);
  log.error(err.stack);
  app.exit();
});

const store = new Store<TypedStore>({
  defaults: {
    state: false,
    x: undefined,
    y: undefined,
    quality: 1,
    bmp: true,
    open: false,
  },
});

const gotTheLock = app.requestSingleInstanceLock();
const isDarwin = process.platform === 'darwin';
const isDev = process.env.NODE_ENV === 'development';

let win: BrowserWindow | null = null;
let filepath: string | null = null;
let config = false;

const getResourceDirectory = (): string => {
  return isDev
    ? path.join(process.cwd(), 'dist')
    : path.join(process.resourcesPath, 'app.asar.unpacked', 'dist');
};

if (!gotTheLock && !isDarwin) {
  app.exit();
} else {
  app.on('second-instance', (_e, argv) => {
    if (win?.isMinimized()) win.restore();
    win?.focus();

    if (!isDarwin && argv.length >= 4) {
      win?.webContents.send('dropped', argv[argv.length - 1]);
    }
  });

  app.once('will-finish-launching', () => {
    app.once('open-file', (e, path) => {
      e.preventDefault();
      filepath = path;
    });
  });

  app.once('ready', () => {
    win = new BrowserWindow({
      x: store.get('x'),
      y: store.get('y'),
      width: 400,
      height: isDarwin ? 300 : 320,
      backgroundColor: '#1b2a41',
      title: 'gen-icons',
      show: false,
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      titleBarStyle: 'hidden',
      webPreferences: {
        enableRemoteModule: false,
        nodeIntegration: false,
        contextIsolation: true,
        safeDialogs: true,
        sandbox: true,
        preload: path.resolve(getResourceDirectory(), 'preload.js'),
      },
    });

    ipcMain.handle('platform', () => process.platform === 'darwin');
    ipcMain.handle('mime-check', (_e, filepath) => mime.lookup(filepath));
    ipcMain.handle('make-ico', (_e, filepath) => mkico(filepath, store));
    ipcMain.handle('make-icns', (_e, filepath) => mkicns(filepath, store));

    ipcMain.handle('success-dialog', (_e, arg) => {
      if (win && isDarwin) {
        successDarwin(win, arg, store);
      } else if (win && !isDarwin) {
        successWin32(win, arg);
      }
    });

    ipcMain.handle('error-dialog', async (_e, arg) => {
      if (win) {
        await dialog
          .showMessageBox(win, {
            type: 'error',
            title: 'ERROR',
            message: 'Error!',
            detail: arg,
          })
          .catch((err) => console.log(`Something went wrong: ${err}`));
      }
    });

    ipcMain.handle('open-file-dialog', async () => {
      if (win) {
        const filepath = await dialog
          .showOpenDialog(win, {
            properties: ['openFile'],
            title: 'Select',
            filters: [
              {
                name: 'PNG file',
                extensions: ['png'],
              },
            ],
          })
          .then((result) => {
            if (result.canceled) return;
            return result.filePaths[0];
          })
          .catch((err): void => console.log(err));

        return filepath;
      }
    });

    ipcMain.on('change-state', (_e, arg) => {
      config = arg;
    });

    win.once('ready-to-show', () => win?.show());

    win.webContents.once('did-finish-load', () => {
      const state = store.get('state', false);
      win?.webContents.send('set-state', state);

      if (!isDarwin && !isDev && process.argv.length >= 2) {
        win?.webContents.send('dropped', process.argv[process.argv.length - 1]);
      }

      if (isDarwin && filepath) {
        win?.webContents.send('dropped', filepath);
        filepath = null;
      }
    });

    win.loadFile('dist/index.html');

    if (isDev) {
      win.webContents.openDevTools({ mode: 'detach' });
      loadDevtool(loadDevtool.REACT_DEVELOPER_TOOLS);
    }

    const menu = createMenu(win, store);
    Menu.setApplicationMenu(menu);

    if (isDarwin) autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.once('error', (_e, err) => {
      log.info(`Error in auto-updater: ${err}`);
    });

    autoUpdater.once('update-downloaded', async () => {
      log.info(`Update downloaded...`);

      if (win) {
        await dialog
          .showMessageBox(win, {
            type: 'info',
            buttons: ['Restart', 'Cancel'],
            defaultId: 0,
            cancelId: 1,
            title: 'Update',
            message: 'Updates are available!',
            detail:
              'We have finished downloading the latest updates.\nDo you want to install the updates now?',
          })
          .then((result) => {
            result.response === 0 && autoUpdater.quitAndInstall();
          })
          .catch((err) => log.info(`Error in showMessageBox: ${err}`));
      }
    });

    win.once('close', () => {
      store.set('state', config);

      if (win) {
        const pos = win.getPosition();
        store.set('x', pos[0]);
        store.set('y', pos[1]);
      }
    });

    win.once('closed', () => {
      win = null;
    });
  });
}

app.on('open-file', (e, path) => {
  e.preventDefault();
  win?.webContents.send('dropped', path);
});

app.setAboutPanelOptions({
  applicationName: app.name,
  applicationVersion: app.getVersion(),
  version: process.versions['electron'],
  copyright: 'Copyright (C) 2020 sprout2000.',
});

app.allowRendererProcessReuse = true;
app.once('window-all-closed', () => app.exit());
