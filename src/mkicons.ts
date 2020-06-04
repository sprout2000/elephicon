import { app } from 'electron';

import fs from 'fs';
import path from 'path';

import Store from 'electron-store';

import {
  setLogger,
  createICO,
  createICNS,
  clearCache,
  NEAREST_NEIGHBOR,
  BICUBIC,
  BEZIER,
} from 'png2icons';

import { TypedStore } from './store';
import { Result } from './result';

const qualities = [NEAREST_NEIGHBOR, BICUBIC, BEZIER];

export const mkico = async (
  filepath: string,
  store: Store<TypedStore>
): Promise<Result> => {
  const dirname = app.getPath('desktop');
  const basename = path.basename(filepath, path.extname(filepath));

  const num = store.get('quality', 1);
  const bmp = store.get('bmp', true);

  const result: Result = await fs.promises
    .readFile(filepath)
    .then(async (buffer) => {
      setLogger(console.log);
      console.log(`Quality: ${num}`);
      console.log(`BMP: ${bmp}`);

      const ico = createICO(buffer, qualities[num], 0, !bmp, bmp);
      if (!ico) throw new Error();

      await fs.promises
        .writeFile(path.join(dirname, `${basename}.ico`), ico)
        .then(() => {
          console.log(`created: ${dirname}${path.sep}${basename}.ico`);
        });
    })
    .then(() => {
      clearCache();
      console.log('Successfully Completed!');

      return { type: 'success', msg: `${basename}.ico` };
    })
    .catch((err: string) => {
      console.log(`Something went wrong: ${err}`);

      return { type: 'failed', msg: err };
    });

  return result;
};

export const mkicns = async (
  filepath: string,
  store: Store<TypedStore>
): Promise<Result> => {
  const dirname = app.getPath('desktop');
  const basename = path.basename(filepath, path.extname(filepath));

  const num = store.get('quality', 1);

  const result: Result = await fs.promises
    .readFile(filepath)
    .then(async (buffer) => {
      setLogger(console.log);
      console.log(`Quality: ${num}`);

      const icns = createICNS(buffer, qualities[num], 0);
      if (!icns) throw new Error();

      await fs.promises
        .writeFile(path.join(dirname, `${basename}.icns`), icns)
        .then(() => {
          console.log(`created: ${dirname}${path.sep}${basename}.icns`);
        });
    })
    .then(() => {
      clearCache();
      console.log('Successfully Completed!');

      return { type: 'success', msg: `${basename}.icns` };
    })
    .catch((err: string) => {
      console.log(`Something went wrong: ${err}`);

      return { type: 'failed', msg: err };
    });

  return result;
};
