import { BrowserWindow, app, ipcMain, dialog, Menu } from 'electron';
import loadDevtool from 'electron-load-devtool';
import Store from 'electron-store';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

import path from 'path';
import mime from 'mime-types';

import { mkico, mkicns } from './mkicons';
import { TypedStore } from './store';
import { template } from './template';
import { win32menu } from './win32menu';
import { contextMenu } from './contextmenu';

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
    quality: 2,
    bmp: true,
  },
});

const gotTheLock = app.requestSingleInstanceLock();
const isDarwin = process.platform === 'darwin';
const isDev = process.env.NODE_ENV === 'development';

let filepath: string | null = null;
let config = false;

const getResourceDirectory = (): string => {
  return isDev
    ? path.join(process.cwd(), 'dist')
    : path.join(process.resourcesPath, 'app.asar.unpacked', 'dist');
};

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    x: store.get('x'),
    y: store.get('y'),
    width: 360,
    height: 320,
    show: false,
    frame: isDarwin ? false : true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    backgroundColor: '#005bea',
    webPreferences: {
      enableRemoteModule: false,
      nodeIntegration: false,
      contextIsolation: true,
      safeDialogs: true,
      sandbox: true,
      preload: path.resolve(getResourceDirectory(), 'preload.js'),
    },
  });

  app.on('second-instance', (_e, argv) => {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();

    if (!isDarwin && argv.length >= 4) {
      mainWindow.webContents.send('dropped', argv[argv.length - 1]);
    }
  });

  app.on('open-file', (e, path) => {
    e.preventDefault();

    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();

    mainWindow.webContents.send('dropped', path);
  });

  ipcMain.handle('mime-check', (_e, filepath) => mime.lookup(filepath));
  ipcMain.handle('make-ico', (_e, filepath) => mkico(filepath, store));
  ipcMain.handle('make-icns', (_e, filepath) => mkicns(filepath, store));

  ipcMain.handle('open-file-dialog', async () => {
    const filepath = await dialog
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

    return filepath;
  });

  ipcMain.on('change-state', (_e, arg) => {
    config = arg;
  });

  ipcMain.once('close-window', () => mainWindow.close());

  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.webContents.once('did-finish-load', () => {
    const state = store.get('state', false);
    mainWindow.webContents.send('set-state', state);

    if (!isDarwin && !isDev && process.argv.length >= 2) {
      const filepath = process.argv[process.argv.length - 1];

      mainWindow.webContents.send('dropped', filepath);
    }

    if (isDarwin && filepath) {
      mainWindow.webContents.send('dropped', filepath);
      filepath = null;
    }
  });

  mainWindow.loadFile('dist/index.html');

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    loadDevtool(loadDevtool.REACT_DEVELOPER_TOOLS);
  }

  if (isDarwin) {
    const mainMenu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(mainMenu);

    const menu = contextMenu(mainWindow, store);
    ipcMain.on('open-contextmenu', () => menu.popup());

    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.once('error', (_e, err) => {
      log.info(`Error in auto-updater: ${err}`);
    });

    autoUpdater.once('update-downloaded', async () => {
      log.info(`Update downloaded...`);

      await dialog
        .showMessageBox(mainWindow, {
          type: 'info',
          buttons: ['Restart', 'Cancel'],
          defaultId: 0,
          cancelId: 1,
          title: 'Update',
          message: 'Updates are available!',
          detail:
            'We have finished downloading the latest updates.\n' +
            'Do you want to install the updates now?',
        })
        .then((result) => {
          result.response === 0 && autoUpdater.quitAndInstall();
        })
        .catch((err) => log.info(`Error in showMessageBox: ${err}`));
    });
  } else {
    const menu = win32menu(mainWindow, store);
    Menu.setApplicationMenu(menu);
  }

  mainWindow.once('close', () => {
    store.set('state', config);

    const pos = mainWindow.getPosition();
    store.set('x', pos[0]);
    store.set('y', pos[1]);
  });
};

if (!gotTheLock && !isDarwin) {
  app.exit();
} else {
  app.once('will-finish-launching', () => {
    app.once('open-file', (e, path) => {
      e.preventDefault();
      filepath = path;
    });
  });

  app.whenReady().then(() => createWindow());

  app.setAboutPanelOptions({
    applicationName: app.name,
    applicationVersion: app.getVersion(),
    version: process.versions['electron'],
    copyright: 'Copyright (C) 2020 sprout2000.',
  });

  app.allowRendererProcessReuse = true;
  app.once('window-all-closed', () => app.exit());
}
