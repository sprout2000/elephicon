import { BrowserWindow, app, ipcMain, dialog, Menu } from 'electron';
import loadDevtool from 'electron-load-devtool';
import stateKeeper from 'electron-window-state';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

import fs from 'fs';
import path from 'path';

import mime from 'mime-types';
import { setLogger, createICNS, createICO, BICUBIC } from 'png2icons';

import template from './menu';

console.log = log.log;
autoUpdater.logger = log;
log.info('App starting...');

const getResourceDirectory = (): string => {
  return process.env.NODE_ENV === 'development'
    ? path.join(process.cwd(), 'dist')
    : path.join(process.resourcesPath, 'app.asar.unpacked', 'dist');
};

const createWindow = (): void => {
  const windowState = stateKeeper({});

  const win = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: 400,
    height: 300,
    backgroundColor: '#2B2E3B',
    title: 'GenICNS',
    show: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      enableRemoteModule: false,
      nodeIntegration: false,
      contextIsolation: true,
      safeDialogs: true,
      sandbox: true,
      preload: path.resolve(getResourceDirectory(), 'preload.js'),
    },
  });

  ipcMain.handle('dropped-file', async (_e, filepath) => {
    const mimetype = mime.lookup(filepath);

    if (!mimetype || !mimetype.match(/png/)) {
      const message = mimetype ? mimetype : 'Unknown';

      await dialog.showMessageBox(win, {
        type: 'error',
        buttons: ['OK'],
        title: 'ERROR',
        message: 'Error!',
        detail: `Invalid Format: ${message}.`,
      });

      return true;
    }

    const dirname = path.dirname(filepath);
    if (!dirname) {
      await dialog.showMessageBox(win, {
        type: 'error',
        buttons: ['OK'],
        title: 'ERROR',
        message: `Something went wrong...`,
      });

      return true;
    }

    const hash = new Date().getTime().toString();
    const dest = path.join(dirname, `icons-${hash}`);

    await fs.promises
      .mkdir(dest)
      .then(async () => {
        console.log(`create: ${dest}`);

        await fs.promises.readFile(filepath).then(async (buffer) => {
          setLogger(console.log);

          const icns = createICNS(buffer, BICUBIC, 0);
          const ico = createICO(buffer, BICUBIC, 0, false);

          await fs.promises
            .writeFile(path.join(dest, 'icon.icns'), icns)
            .then(() => console.log(`create: ${dest}${path.sep}icon.icns`));

          await fs.promises
            .writeFile(path.join(dest, 'icon.ico'), ico)
            .then(() => console.log(`create: ${dest}${path.sep}icon.ico`));
        });
      })
      .then(async () => {
        console.log('Successfully Completed!');

        await dialog.showMessageBox(win, {
          type: 'info',
          buttons: ['OK'],
          title: 'Successfully Completed!',
          message: 'Successfully Completed!',
          detail: `Created: ${dest}`,
        });
      })
      .catch(async (err) => {
        console.log(`Something went wrong: ${err}`);

        await dialog.showMessageBox(win, {
          type: 'error',
          buttons: ['OK'],
          title: 'ERROR',
          message: 'Error!',
          detail: `Something went wrong: ${err}`,
        });
      });

    return true;
  });

  win.once('ready-to-show', () => win.show());

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

  autoUpdater.once('update-downloaded', async () => {
    log.info(`Update downloaded...`);

    await dialog
      .showMessageBox(win, {
        type: 'info',
        buttons: ['Restart', 'Cancel'],
        defaultId: 0,
        cancelId: 1,
        title: 'Update Downloaded',
        message: 'Update downloaded',
        detail: `We have finished downloading the latest updates.
            Do you want to install the updates now?`,
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      })
      .catch((err) => log.info(`Error in showMessageBox: ${err}`));
  });

  windowState.manage(win);
};

app.once('ready', createWindow);

app.setAboutPanelOptions({
  applicationName: app.name,
  applicationVersion: app.getVersion(),
  copyright: 'Copyright (C) 2020 Office Nishigami.',
});

app.allowRendererProcessReuse = true;
app.once('window-all-closed', () => app.quit());

process.once('uncaughtException', (err) => {
  log.error('electron:uncaughtException');
  log.error(err.name);
  log.error(err.message);
  log.error(err.stack);
  app.exit();
});
