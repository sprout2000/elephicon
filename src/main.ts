import { BrowserWindow, app, ipcMain, dialog, Menu } from 'electron';
import loadDevtool from 'electron-load-devtool';
import stateKeeper from 'electron-window-state';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

import path from 'path';
import mime from 'mime-types';

import { mkico, mkicns } from './mkicons';
import template from './menu';

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

const gotTheLock = app.requestSingleInstanceLock();
const win32 = process.platform === 'win32';
const darwin = process.platform === 'darwin';

let win: BrowserWindow | null;
let filepath: string | null = null;

const getResourceDirectory = (): string => {
  return process.env.NODE_ENV === 'development'
    ? path.join(process.cwd(), 'dist')
    : path.join(process.resourcesPath, 'app.asar.unpacked', 'dist');
};

if (!gotTheLock && win32) {
  app.exit();
} else {
  app.on('second-instance', (_e, argv) => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }

    if (win32 && argv.length >= 4) {
      if (win) win.webContents.send('dropped', argv[argv.length - 1]);
    }
  });

  app.once('will-finish-launching', () => {
    app.once('open-file', (e, path) => {
      e.preventDefault();
      filepath = path;
    });
  });

  app.once('ready', () => {
    const windowState = stateKeeper({});

    win = new BrowserWindow({
      x: windowState.x,
      y: windowState.y,
      width: 400,
      height: 300,
      backgroundColor: '#2B2E3B',
      title: 'GenICNS',
      show: false,
      resizable: false,
      maximizable: false,
      fullscreenable: false,
      titleBarStyle: 'hidden',
      autoHideMenuBar: true,
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
    ipcMain.handle('make-ico', (_e, filepath) => mkico(filepath));
    ipcMain.handle('make-icns', (_e, filepath) => mkicns(filepath));

    ipcMain.handle('open-dialog', async (_e, arg, type) => {
      if (win) {
        await dialog.showMessageBox(win, {
          type: type,
          title: type === 'error' ? 'ERROR' : 'Completed',
          message: type === 'error' ? 'Error!' : 'Successfully Completed!',
          detail: arg,
        });
      }
    });

    win.once('ready-to-show', () => {
      if (win) win.show();
    });

    win.loadFile('dist/index.html');
    if (process.env.NODE_ENV === 'development') {
      win.webContents.openDevTools({ mode: 'detach' });
      loadDevtool(loadDevtool.REACT_DEVELOPER_TOOLS);
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    autoUpdater.checkForUpdatesAndNotify();
    autoUpdater.once('error', (_e, err) => {
      log.info(`Error in auto-updater: ${err}`);
    });

    win.webContents.once('did-finish-load', () => {
      if (win && win32 && process.argv.length >= 2) {
        win.webContents.send('dropped', process.argv[process.argv.length - 1]);
      }

      if (win && darwin && filepath) {
        win.webContents.send('dropped', filepath);
        filepath = null;
      }
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
            if (result.response === 0) {
              autoUpdater.quitAndInstall();
            }
          })
          .catch((err) => log.info(`Error in showMessageBox: ${err}`));
      }
    });

    windowState.manage(win);
  });
}

app.on('open-file', (e, path) => {
  e.preventDefault();
  if (win) win.webContents.send('dropped', path);
});

app.setAboutPanelOptions({
  applicationName: app.name,
  applicationVersion: app.getVersion(),
  copyright: 'Copyright (C) 2020 Office Nishigami.',
});

app.allowRendererProcessReuse = true;
app.once('window-all-closed', () => app.quit());
