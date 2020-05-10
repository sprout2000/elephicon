import { app, MenuItemConstructorOptions, shell, Menu } from 'electron';
import Store from 'electron-store';

const createMenu = (store: Store): Menu => {
  const darwin = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [
    {
      label: '&File',
      submenu: [
        {
          label: darwin ? 'Close' : 'Quit',
          accelerator: darwin ? 'Cmd+W' : 'Ctrl+Q',
          role: darwin ? 'close' : 'quit',
        },
      ],
    },
  ];

  const preferences: MenuItemConstructorOptions = {
    label: '&Preferences',
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

  if (!darwin) {
    template.push(preferences, {
      label: '&Help',
      role: 'help',
      submenu: [
        {
          label: 'Support URL...',
          click: async (): Promise<void> =>
            await shell.openExternal(
              'https://github.com/sprout2000/gen-icns#readme'
            ),
        },
        { type: 'separator' },
        {
          label: 'About',
          accelerator: 'Ctrl+I',
          click: (): void => app.showAboutPanel(),
        },
      ],
    });
  }

  if (darwin) {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        preferences,
        { type: 'separator' },
        { role: 'services' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
    template.push({
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'Support URL...',
          click: async (): Promise<void> =>
            await shell.openExternal(
              'https://github.com/sprout2000/gen-icns#readme'
            ),
        },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);

  return menu;
};

export default createMenu;
