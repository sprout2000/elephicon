import { BrowserWindow, app, ipcMain, dialog, Menu, session } from 'electron';
import log from 'electron-log';
import Store from 'electron-store';
import { autoUpdater } from 'electron-updater';

import path from 'path';
import mime from 'mime-types';

import { createMenu } from './createMenu';
import { setLocales } from './lib/setLocales';
import { mkico, mkicns } from './mkicons';
import { searchDevtools } from './searchDevtools';

import { TypedStore } from './lib/TypedStore';

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
    ico: true,
    desktop: true,
    x: undefined,
    y: undefined,
    quality: 2,
    bmp: true,
  },
});

const isDarwin = process.platform === 'darwin';
const isDev = process.env.NODE_ENV === 'development';

const gotTheLock = app.requestSingleInstanceLock();

/// #if DEBUG
const execPath =
  process.platform === 'win32'
    ? '../node_modules/electron/dist/electron.exe'
    : '../node_modules/.bin/electron';

if (isDev) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('electron-reload')(__dirname, {
    electron: path.resolve(__dirname, execPath),
    forceHardReset: true,
    hardResetMethod: 'exit',
  });
}
/// #endif

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    x: store.get('x'),
    y: store.get('y'),
    width: isDarwin ? 360 : 400,
    height: isDarwin ? 320 : 340,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: isDarwin ? 'hidden' : 'default',
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    backgroundColor: '#005bea',
    webPreferences: {
      sandbox: true,
      safeDialogs: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  ipcMain.handle('mime-check', (_e, filepath) => mime.lookup(filepath));
  ipcMain.handle('make-ico', (_e, filepath) => mkico(filepath, store));
  ipcMain.handle('make-icns', (_e, filepath) => mkicns(filepath, store));

  ipcMain.handle('open-file-dialog', async () => {
    return dialog
      .showOpenDialog(mainWindow, {
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
  });

  if (isDarwin && !isDev) {
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.once('error', (_e, err) => {
      log.info(`Error in auto-updater: ${err}`);
    });

    autoUpdater.once('update-downloaded', async () => {
      log.info(`Update downloaded...`);

      await dialog
        .showMessageBox(mainWindow, {
          type: 'info',
          buttons: ['Restart', 'Not now'],
          defaultId: 0,
          cancelId: 1,
          title: 'Update',
          message: 'Updates are available!',
          detail:
            'We have finished downloading the latest updates.\n' +
            'Would you like to install the update and restart now?',
        })
        .then((result) => {
          if (result.response === 0) {
            autoUpdater.quitAndInstall();
          } else {
            log.info('The installation of the update has been cancelled...');
          }
        })
        .catch((err) => log.info(`Error in showMessageBox: ${err}`));
    });
  }

  const menu = createMenu(mainWindow, store);
  Menu.setApplicationMenu(menu);

  ipcMain.on('show-context-menu', () => {
    menu.popup();
  });

  if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
  mainWindow.loadFile('dist/index.html');
  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.once('close', () => {
    const pos = mainWindow.getPosition();
    store.set('x', pos[0]);
    store.set('y', pos[1]);
  });
};

if (!gotTheLock && !isDarwin) {
  app.exit();
} else {
  app.whenReady().then(async () => {
    const locale = app.getLocale();
    setLocales(locale);

    if (isDev) {
      const extPath = await searchDevtools();
      if (extPath) {
        await session.defaultSession
          .loadExtension(extPath, {
            allowFileAccess: true,
          })
          .then(() => console.log('React Devtools loaded...'))
          .catch((err) => console.log(err));
      }
    }

    createWindow();
  });

  app.setAboutPanelOptions({
    applicationName: app.name,
    applicationVersion: isDarwin
      ? app.getVersion()
      : `v${app.getVersion()} (${process.versions['electron']})`,
    version: process.versions['electron'],
    iconPath: path.join(__dirname, 'icon.png'),
    copyright: '© 2020 sprout2000 and other contributors',
  });

  app.once('window-all-closed', () => app.exit());
}
