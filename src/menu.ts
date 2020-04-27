import { app, MenuItemConstructorOptions, shell } from 'electron';

const darwin = process.platform === 'darwin';

const template: MenuItemConstructorOptions[] = [{ role: 'fileMenu' }];

if (!darwin) {
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
  template.unshift({ role: 'appMenu' });
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

export default template;
