import {
  app,
  dialog,
  BrowserWindow,
  Menu,
  MenuItemConstructorOptions,
  shell,
} from 'electron';
import Store from 'electron-store';
import i18next from 'i18next';

import { TypedStore } from './store';

export const createMenu = (
  win: BrowserWindow,
  store: Store<TypedStore>
): Menu => {
  const darwin = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    {
      label: i18next.t('file'),
      submenu: [
        {
          label: i18next.t('open'),
          accelerator: 'CmdOrCtrl+O',
          click: async (): Promise<void> => {
            await dialog
              .showOpenDialog(win, {
                properties: ['openFile'],
                title: i18next.t('select'),
                filters: [
                  {
                    name: 'PNG File',
                    extensions: ['png'],
                  },
                ],
              })
              .then((result): void => {
                if (result.canceled) return;
                win.webContents.send('menu-open', result.filePaths[0]);
              })
              .catch((err): void => console.log(err));
          },
        },
        { type: 'separator' },
        {
          label: darwin ? i18next.t('close') : i18next.t('quit'),
          accelerator: darwin ? 'Cmd+W' : 'Ctrl+Q',
          role: darwin ? 'close' : 'quit',
        },
      ],
    },
    {
      label: i18next.t('settings'),
      submenu: [
        {
          label: i18next.t('quality'),
          submenu: [
            {
              label: i18next.t('low'),
              type: 'radio',
              id: 'low',
              click: (): void => store.set('quality', 0),
              checked: store.get('quality') === 0,
            },
            {
              label: i18next.t('medium'),
              type: 'radio',
              id: 'mid',
              click: (): void => store.set('quality', 1),
              checked: store.get('quality') === 1,
            },
            {
              label: i18next.t('high'),
              type: 'radio',
              id: 'high',
              click: (): void => store.set('quality', 2),
              checked: store.get('quality') === 2,
            },
          ],
        },
        {
          label: 'ICO',
          submenu: [
            {
              label: i18next.t('bmp'),
              type: 'radio',
              id: 'bmp',
              click: (): void => store.set('bmp', true),
              checked: store.get('bmp'),
            },
            {
              label: i18next.t('png'),
              type: 'radio',
              id: 'png',
              click: (): void => store.set('bmp', false),
              checked: !store.get('bmp'),
            },
          ],
        },
        {
          label: i18next.t('destination'),
          submenu: [
            {
              label: i18next.t('desktop'),
              type: 'radio',
              id: 'desktop',
              click: (): void => {
                store.set('desktop', true);
                win.webContents.send('set-desktop', true);
              },
              checked: store.get('desktop'),
            },
            {
              label: i18next.t('same'),
              type: 'radio',
              id: 'current',
              click: (): void => {
                store.set('desktop', false);
                win.webContents.send('set-desktop', false);
              },
              checked: !store.get('desktop'),
            },
          ],
        },
      ],
    },
  ];

  if (!darwin) {
    template.push({
      label: i18next.t('help'),
      submenu: [
        {
          label: i18next.t('support'),
          click: async (): Promise<void> =>
            await shell.openExternal('https://sprout2000.github.io/elephicon'),
        },
        {
          label: i18next.t('about'),
          accelerator: 'Ctrl+I',
          click: () => app.showAboutPanel(),
        },
        { type: 'separator' },
        {
          label: i18next.t('devtools'),
          accelerator: 'Ctrl+Shift+I',
          click: (): void => {
            if (win.webContents.isDevToolsOpened()) {
              win.webContents.closeDevTools();
            } else {
              win.webContents.openDevTools({ mode: 'detach' });
            }
          },
        },
      ],
    });
  }

  if (darwin) {
    template.push({
      label: i18next.t('help'),
      role: 'help',
      submenu: [
        {
          label: i18next.t('support'),
          click: async (): Promise<void> =>
            await shell.openExternal(
              'https://github.com/sprout2000/elephicon#readme'
            ),
        },
        { type: 'separator' },
        {
          label: i18next.t('devtools'),
          accelerator: 'Cmd+Option+I',
          click: (): void => {
            if (win.webContents.isDevToolsOpened()) {
              win.webContents.closeDevTools();
            } else {
              win.webContents.openDevTools({ mode: 'detach' });
            }
          },
        },
      ],
    });

    template.unshift({
      label: 'Elephicon',
      submenu: [
        {
          label: i18next.t('about'),
          accelerator: 'Cmd+I',
          role: 'about',
        },
        { type: 'separator' },
        {
          label: i18next.t('hide'),
          role: 'hide',
        },
        {
          label: i18next.t('hideOthers'),
          role: 'hideOthers',
        },
        {
          label: i18next.t('unhide'),
          role: 'unhide',
        },
        { type: 'separator' },
        {
          label: i18next.t('quit'),
          role: 'quit',
        },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  return menu;
};
