import { app, MenuItemConstructorOptions } from 'electron';

export const template: MenuItemConstructorOptions[] = [
  {
    label: app.name,
    role: 'appMenu',
  },
];
