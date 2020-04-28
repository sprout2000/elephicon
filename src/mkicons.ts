import { BrowserWindow, dialog } from 'electron';

import fs from 'fs';
import path from 'path';

import mime from 'mime-types';
import { setLogger, createICNS, createICO, BICUBIC } from 'png2icons';

const mkicons = async (
  filepath: string,
  win: BrowserWindow
): Promise<boolean> => {
  const mimetype = mime.lookup(filepath);

  if (!mimetype || !mimetype.match(/png/)) {
    const message = mimetype ? mimetype : 'Unknown';

    await dialog.showMessageBox(win, {
      type: 'error',
      buttons: ['OK'],
      title: 'ERROR',
      message: 'Error!',
      detail: `Invalid Format: ${message}.`,
    });

    return true;
  }

  const dirname = path.dirname(filepath);
  if (!dirname) {
    await dialog.showMessageBox(win, {
      type: 'error',
      buttons: ['OK'],
      title: 'ERROR',
      message: `Something went wrong...`,
    });

    return true;
  }

  const hash = new Date().getTime().toString();
  const dest = path.join(dirname, `icons-${hash}`);

  await fs.promises
    .mkdir(dest)
    .then(async () => {
      console.log(`create: ${dest}`);

      await fs.promises
        .readFile(filepath)
        .then(async (buffer) => {
          setLogger(console.log);

          const icns = createICNS(buffer, BICUBIC, 0);
          const ico = createICO(buffer, BICUBIC, 0, false);

          await fs.promises
            .writeFile(path.join(dest, 'icon.icns'), icns)
            .then(() => console.log(`create: ${dest}${path.sep}icon.icns`))
            .catch((err) => {
              throw new Error(err);
            });

          await fs.promises
            .writeFile(path.join(dest, 'icon.ico'), ico)
            .then(() => console.log(`create: ${dest}${path.sep}icon.ico`))
            .catch((err) => {
              throw new Error(err);
            });
        })
        .catch((err) => {
          throw new Error(err);
        });
    })
    .then(async () => {
      console.log('Successfully Completed!');

      await dialog.showMessageBox(win, {
        type: 'info',
        buttons: ['OK'],
        title: 'Successfully Completed!',
        message: 'Successfully Completed!',
        detail: `Created: ${dest}`,
      });
    })
    .catch(async (err) => {
      console.log(`Something went wrong: ${err}`);

      await dialog.showMessageBox(win, {
        type: 'error',
        buttons: ['OK'],
        title: 'ERROR',
        message: 'Error!',
        detail: `Something went wrong: ${err}`,
      });
    });

  return true;
};

export default mkicons;
