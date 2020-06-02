import {
  app,
  MenuItemConstructorOptions,
  shell,
  Menu,
  dialog,
  BrowserWindow,
} from 'electron';
import Store from 'electron-store';

import { TypedStore } from './store';

const isDarwin = process.platform === 'darwin';
const url = 'https://github.com/sprout2000/elephicon#readme';

export const createMenu = (
  win: BrowserWindow,
  store: Store<TypedStore>
): Menu => {
  const preferences: MenuItemConstructorOptions = {
    label: 'Preferences',
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
    ],
  };

  const template_windows: MenuItemConstructorOptions[] = [
    {
      label: '&File',
      submenu: [
        {
          label: 'Open...',
          accelerator: 'Ctrl+O',
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
        preferences,
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Ctrl+Q',
          role: 'quit',
        },
      ],
    },
    {
      label: '&Help',
      submenu: [
        {
          label: 'Support URL...',
          click: async (): Promise<void> => await shell.openExternal(url),
        },
        {
          label: 'About Elephicon',
          accelerator: 'Ctrl+I',
          click: () => app.showAboutPanel(),
        },
      ],
    },
  ];

  const template_darwin: MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        {
          role: 'about',
          accelerator: 'Cmd+I',
        },
        { type: 'separator' },
        preferences,
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'Open...',
          accelerator: 'Cmd+O',
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
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'Support URL...',
          click: async (): Promise<void> => await shell.openExternal(url),
        },
      ],
    },
  ];

  const template = isDarwin ? template_darwin : template_windows;
  const menu = Menu.buildFromTemplate(template);

  return menu;
};
