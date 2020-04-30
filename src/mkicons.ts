import { BrowserWindow, dialog } from 'electron';

import fs from 'fs';
import path from 'path';

import mime from 'mime-types';
import { setLogger, createICNS, createICO, BEZIER } from 'png2icons';

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
  const hash = new Date().getTime().toString();
  const dest = path.join(dirname, `icons-${hash}`);

  await fs.promises
    .mkdir(dest)
    .then(async () => {
      console.log(`created: ${dest}`);

      await fs.promises
        .readFile(filepath)
        .then(async (buffer) => {
          setLogger(console.log);
          const icns = createICNS(buffer, BEZIER, 0);

          return await fs.promises
            .writeFile(path.join(dest, 'icon.icns'), icns)
            .then(() => {
              console.log(`created: ${dest}${path.sep}icon.icns`);
              return buffer;
            });
        })
        .then(async (buffer) => {
          setLogger(console.log);
          const ico = createICO(buffer, BEZIER, 0, false, true);

          await fs.promises
            .writeFile(path.join(dest, 'icon.ico'), ico)
            .then(() => console.log(`created: ${dest}${path.sep}icon.ico`));
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
        });
    })
    .catch(async (err) => {
      console.log(`Something went wrong: ${err}`);

      dialog.showMessageBox(win, {
        type: 'error',
        title: 'ERROR',
        message: 'Error!',
        detail: `Something went wrong: ${err}`,
      });
    });

  return true;
};

export default mkicons;
