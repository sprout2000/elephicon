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

const localeList = [
  'de',
  'en',
  'it',
  'ja',
  'ml',
  'pt',
  'ru',
  'tr',
  'uk',
  'zh-CN',
];

const translate = (locale: string) => {
  switch (locale) {
    case 'de':
      return 'Deutsch';
    case 'en':
      return 'English';
    case 'it':
      return 'Italiano';
    case 'ja':
      return '日本語';
    case 'ml':
      return 'Malayalam';
    case 'pt':
      return 'Português';
    case 'ru':
      return 'Русский';
    case 'tr':
      return 'Türkçe';
    case 'uk':
      return 'Українська';
    case 'zh-CN':
      return '简体中文';
    default:
      return 'English';
  }
};

export const createMenu = (
  win: BrowserWindow,
  store: Store<StoreType>
): Menu => {
  const isDarwin = process.platform === 'darwin';
  const isDevelop = process.env.NODE_ENV === 'development';

  const helpSub: MenuItemConstructorOptions[] = [
    {
      label: i18next.t('Support URL...'),
      click: async (): Promise<void> =>
        shell.openExternal('https://github.com/sprout2000/elephicon/#readme'),
    },
  ];

  const langSub: MenuItemConstructorOptions[] = [];

  localeList.map((locale) => {
    langSub.push({
      label: translate(locale),
      type: 'radio',
      id: `language-${locale}`,
      click: () => {
        store.set('language', locale);
      },
      checked: store.get('language') === locale,
    });
  });

  if (isDevelop) {
    helpSub.push(
      { type: 'separator' },
      {
        label: i18next.t('Toggle Developer Tools'),
        accelerator: isDarwin ? 'Cmd+Option+I' : 'Ctrl+Shift+I',
        click: (): void => {
          if (win.webContents.isDevToolsOpened()) {
            win.webContents.closeDevTools();
          } else {
            win.webContents.openDevTools({ mode: 'detach' });
          }
        },
      }
    );
  }

  if (!isDarwin) {
    helpSub.unshift({
      label: i18next.t('About Elephicon'),
      accelerator: 'Ctrl+I',
      click: () => app.showAboutPanel(),
    });
  }

  const template: MenuItemConstructorOptions[] = [
    {
      label: i18next.t('File'),
      submenu: [
        {
          label: i18next.t('Open...'),
          accelerator: 'CmdOrCtrl+O',
          click: async (): Promise<void> => {
            await dialog
              .showOpenDialog(win, {
                properties: ['openFile'],
                title: i18next.t('Select a PNG File'),
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
          label: isDarwin ? i18next.t('Close') : i18next.t('Quit Elephicon'),
          accelerator: isDarwin ? 'Cmd+W' : 'Alt+F4',
          role: isDarwin ? 'close' : 'quit',
        },
      ],
    },
    {
      label: i18next.t('Settings'),
      submenu: [
        {
          label: i18next.t('Quality'),
          submenu: [
            {
              label: i18next.t('Low'),
              type: 'radio',
              id: 'low',
              click: (): void => store.set('quality', 0),
              checked: store.get('quality') === 0,
            },
            {
              label: i18next.t('Medium'),
              type: 'radio',
              id: 'mid',
              click: (): void => store.set('quality', 1),
              checked: store.get('quality') === 1,
            },
            {
              label: i18next.t('High'),
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
              label: i18next.t('Use BMP format for the smaller icon sizes'),
              type: 'radio',
              id: 'bmp',
              click: (): void => store.set('bmp', true),
              checked: store.get('bmp'),
            },
            {
              label: i18next.t('Use PNG for each icon in the created ICO file'),
              type: 'radio',
              id: 'png',
              click: (): void => store.set('bmp', false),
              checked: !store.get('bmp'),
            },
          ],
        },
        {
          label: i18next.t('Destination'),
          submenu: [
            {
              label: i18next.t('Desktop'),
              type: 'radio',
              id: 'desktop',
              click: (): void => {
                store.set('desktop', true);
                win.webContents.send('set-desktop', true);
              },
              checked: store.get('desktop'),
            },
            {
              label: i18next.t('Same folder as the input PNGs'),
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
        {
          label: i18next.t('Language'),
          submenu: langSub,
        },
      ],
    },
    {
      label: i18next.t('Help'),
      submenu: helpSub,
    },
  ];

  if (isDarwin) {
    template.unshift({
      label: 'Elephicon',
      submenu: [
        {
          label: i18next.t('About Elephicon'),
          accelerator: 'Cmd+I',
          role: 'about',
        },
        { type: 'separator' },
        {
          label: i18next.t('Hide Elephicon'),
          role: 'hide',
        },
        {
          label: i18next.t('Hide Others'),
          role: 'hideOthers',
        },
        {
          label: i18next.t('Show All'),
          role: 'unhide',
        },
        { type: 'separator' },
        {
          label: i18next.t('Quit Elephicon'),
          role: 'quit',
        },
      ],
    });
  }

  return Menu.buildFromTemplate(template);
};
