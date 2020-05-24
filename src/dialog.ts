import { dialog, BrowserWindow, shell } from 'electron';

import Store from 'electron-store';
import { TypedStore } from './store';

import os from 'os';
import path from 'path';

export const successDarwin = async (
  win: BrowserWindow,
  arg: string,
  store: Store<TypedStore>
): Promise<void> => {
  await dialog
    .showMessageBox(win, {
      type: 'info',
      message: 'Successfully Completed!',
      detail: `created:\n${arg}`,
      checkboxLabel: 'Open in Finder',
      checkboxChecked: store.get('open', false),
    })
    .then((result) => {
      if (result.checkboxChecked) {
        shell.showItemInFolder(arg);
        store.set('open', true);
      } else {
        store.set('open', false);
      }
    })
    .catch((err) => console.log(`Something went wrong: ${err}`));
};

export const successWin32 = async (
  win: BrowserWindow,
  arg: string
): Promise<void> => {
  await dialog
    .showMessageBox(win, {
      type: 'info',
      title: 'Completed',
      message: 'Successfully Completed!',
      detail: `created:\n${arg}`,
      buttons: ['View log', 'Open in Explorer', 'OK'],
      defaultId: 2,
      cancelId: 2,
      noLink: true,
    })
    .then((result) => {
      if (result.response === 0) {
        shell.showItemInFolder(
          path.join(
            os.homedir(),
            '\\AppData\\Roaming\\genicons\\logs\\main.log'
          )
        );
      } else if (result.response === 1) {
        shell.showItemInFolder(arg);
      }
    })
    .catch((err) => console.log(`Something went wrong: ${err}`));
};
