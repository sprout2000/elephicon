import {
  MenuItemConstructorOptions,
  shell,
  Menu,
  dialog,
  BrowserWindow,
} from 'electron';
import Store from 'electron-store';

import { TypedStore } from './store';

const url = 'https://github.com/sprout2000/elephicon#readme';

export const contextMenu = (
  win: BrowserWindow,
  store: Store<TypedStore>
): Menu => {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: async (): Promise<void> => {
            await dialog
              .showOpenDialog(win, {
                properties: ['openFile'],
                title: 'Select',
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
          label: 'Close',
          accelerator: 'Cmd+W',
          role: 'close',
        },
      ],
    },
    {
      label: 'Settings',
      submenu: [
        {
          label: 'Quality',
          submenu: [
            {
              label: 'Low',
              type: 'radio',
              id: 'low',
              click: (): void => store.set('quality', 0),
              checked: store.get('quality') === 0,
            },
            {
              label: 'Medium',
              type: 'radio',
              id: 'mid',
              click: (): void => store.set('quality', 1),
              checked: store.get('quality') === 1,
            },
            {
              label: 'High',
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
              label: 'Use BMP format for the smaller icon sizes',
              type: 'radio',
              id: 'bmp',
              click: (): void => store.set('bmp', true),
              checked: store.get('bmp'),
            },
            {
              label: 'Use PNG for each icon in the created ICO file',
              type: 'radio',
              id: 'png',
              click: (): void => store.set('bmp', false),
              checked: !store.get('bmp'),
            },
          ],
        },
        {
          label: 'Destination',
          submenu: [
            {
              label: 'Desktop',
              type: 'radio',
              id: 'desktop',
              click: (): void => {
                store.set('desktop', true);
                win.webContents.send('set-desktop', true);
              },
              checked: store.get('desktop'),
            },
            {
              label: 'Same folder as the input PNGs',
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
    { type: 'separator' },
    {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'Support URL...',
          click: async (): Promise<void> => await shell.openExternal(url),
        },
        { type: 'separator' },
        {
          label: 'Toggle Developer Tools',
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
    },
  ];

  const menu = Menu.buildFromTemplate(template);

  return menu;
};
