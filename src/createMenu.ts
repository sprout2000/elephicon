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

const localeList: Locale[] = [
  { code: 'de', value: 'Deutsch' },
  { code: 'en', value: 'English' },
  { code: 'it', value: 'Italiano' },
  { code: 'ja', value: '日本語' },
  { code: 'ml', value: 'Malayalam' },
  { code: 'pt', value: 'Português' },
  { code: 'ru', value: 'Русский' },
  { code: 'tr', value: 'Türkçe' },
  { code: 'uk', value: 'Українська' },
  { code: 'zh-CN', value: '简体中文' },
];

export const createMenu = (win: BrowserWindow, store: Store<StoreType>) => {
  const isDarwin = process.platform === 'darwin';

  const langSub: MenuItemConstructorOptions[] = [];
  localeList.map((locale) => {
    langSub.push({
      label: locale.value,
      type: 'radio',
      id: `language-${locale.code}`,
      click: () => {
        if (store.get('language') !== locale.code) {
          store.set('language', locale.code);
          dialog
            .showMessageBox(win, {
              type: 'info',
              message: i18next.t('Warning'),
            })
            .then(() => {
              setImmediate(() => {
                app.relaunch();
                app.exit(0);
              });
            });
        }
      },
      checked: store.get('language') === locale.code,
    });
  });

  const helpSub: MenuItemConstructorOptions[] = [
    {
      label: i18next.t('Support URL...') as string,
      click: () =>
        shell.openExternal('https://github.com/sprout2000/elephicon/#readme'),
    },
  ];

  if (!isDarwin) {
    helpSub.unshift(
      {
        label: i18next.t('About Elephicon') as string,
        accelerator: 'Ctrl+I',
        click: () => app.showAboutPanel(),
      },
      { type: 'separator' }
    );
  }

  const template: MenuItemConstructorOptions[] = [
    {
      label: i18next.t('File') as string,
      submenu: [
        {
          label: i18next.t('Open...') as string,
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            await dialog
              .showOpenDialog(win, {
                properties: ['openFile'],
                title: i18next.t('Select a PNG File') as string,
                filters: [
                  {
                    name: 'PNG File',
                    extensions: ['png'],
                  },
                ],
              })
              .then((result) => {
                if (result.canceled) return;
                win.webContents.send('menu-open', result.filePaths[0]);
              })
              .catch((err) => console.log(err));
          },
        },
        { type: 'separator' },
        {
          label: isDarwin
            ? (i18next.t('Close') as string)
            : (i18next.t('Quit Elephicon') as string),
          accelerator: isDarwin ? 'Cmd+W' : 'Alt+F4',
          role: isDarwin ? 'close' : 'quit',
        },
      ],
    },
    {
      label: i18next.t('Settings') as string,
      submenu: [
        {
          label: i18next.t('Quality') as string,
          submenu: [
            {
              label: i18next.t('Low') as string,
              type: 'radio',
              id: 'low',
              click: () => store.set('quality', 0),
              checked: store.get('quality') === 0,
            },
            {
              label: i18next.t('Medium') as string,
              type: 'radio',
              id: 'mid',
              click: () => store.set('quality', 1),
              checked: store.get('quality') === 1,
            },
            {
              label: i18next.t('High') as string,
              type: 'radio',
              id: 'high',
              click: () => store.set('quality', 2),
              checked: store.get('quality') === 2,
            },
          ],
        },
        {
          label: 'ICO',
          submenu: [
            {
              label: i18next.t(
                'Use BMP format for the smaller icon sizes'
              ) as string,
              type: 'radio',
              id: 'bmp',
              click: () => store.set('bmp', true),
              checked: store.get('bmp'),
            },
            {
              label: i18next.t(
                'Use PNG for each icon in the created ICO file'
              ) as string,
              type: 'radio',
              id: 'png',
              click: () => store.set('bmp', false),
              checked: !store.get('bmp'),
            },
          ],
        },
        {
          label: i18next.t('Destination') as string,
          submenu: [
            {
              label: i18next.t('Desktop') as string,
              type: 'radio',
              id: 'desktop',
              click: () => {
                store.set('desktop', true);
                win.webContents.send('set-desktop', true);
              },
              checked: store.get('desktop'),
            },
            {
              label: i18next.t('Same folder as the input PNGs') as string,
              type: 'radio',
              id: 'current',
              click: () => {
                store.set('desktop', false);
                win.webContents.send('set-desktop', false);
              },
              checked: !store.get('desktop'),
            },
          ],
        },
        {
          label: i18next.t('Language') as string,
          submenu: langSub,
        },
      ],
    },
    {
      label: i18next.t('Help') as string,
      submenu: helpSub,
    },
  ];

  if (isDarwin) {
    template.unshift({
      label: 'Elephicon',
      submenu: [
        {
          label: i18next.t('About Elephicon') as string,
          accelerator: 'Cmd+I',
          role: 'about',
        },
        { type: 'separator' },
        {
          label: i18next.t('Hide Elephicon') as string,
          role: 'hide',
        },
        {
          label: i18next.t('Hide Others') as string,
          role: 'hideOthers',
        },
        {
          label: i18next.t('Show All') as string,
          role: 'unhide',
        },
        { type: 'separator' },
        {
          label: i18next.t('Quit Elephicon') as string,
          role: 'quit',
        },
      ],
    });
  }

  return Menu.buildFromTemplate(template);
};
