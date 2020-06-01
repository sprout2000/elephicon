import { app, MenuItemConstructorOptions } from 'electron';

export const template: MenuItemConstructorOptions[] = [
  {
    label: app.name,
    submenu: [
      {
        role: 'about',
        accelerator: 'Cmd+I',
      },
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
];
