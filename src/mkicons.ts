import fs from 'fs';
import path from 'path';

import Store from 'electron-store';

import {
  setLogger,
  createICO,
  createICNS,
  NEAREST_NEIGHBOR,
  BICUBIC,
  BEZIER,
} from 'png2icons';

interface Result {
  type: string;
  msg: string;
}

const qualities = [NEAREST_NEIGHBOR, BICUBIC, BEZIER];

export const mkico = async (
  filepath: string,
  store: Store
): Promise<Result> => {
  const dirname = path.dirname(filepath);
  const basename = path.basename(filepath, path.extname(filepath));

  const num = store.get('quality', 1);
  const bmp = store.get('bmp');

  const result: Result = await fs.promises
    .readFile(filepath)
    .then(async (buffer) => {
      setLogger(console.log);
      console.log(`Quality: ${num}`);
      console.log(`BMP: ${bmp}`);

      const ico = createICO(buffer, qualities[num], 0, !bmp, bmp);

      await fs.promises
        .writeFile(path.join(dirname, `${basename}.ico`), ico)
        .then(() => {
          console.log(`created: ${dirname}${path.sep}${basename}.ico`);
        });
    })
    .then(() => {
      console.log('Successfully Completed!');

      return { type: 'success', msg: `${dirname}${path.sep}${basename}.ico` };
    })
    .catch((err: string) => {
      console.log(`Something went wrong: ${err}`);

      return { type: 'failed', msg: err };
    });

  return result;
};

export const mkicns = async (
  filepath: string,
  store: Store
): Promise<Result> => {
  const dirname = path.dirname(filepath);
  const basename = path.basename(filepath, path.extname(filepath));

  const num = store.get('quality', 1);

  const result: Result = await fs.promises
    .readFile(filepath)
    .then(async (buffer) => {
      setLogger(console.log);
      console.log(`Quality: ${num}`);

      const icns = createICNS(buffer, qualities[num], 0);

      await fs.promises
        .writeFile(path.join(dirname, `${basename}.icns`), icns)
        .then(() => {
          console.log(`created: ${dirname}${path.sep}${basename}.icns`);
        });
    })
    .then(() => {
      console.log('Successfully Completed!');

      return { type: 'success', msg: `${dirname}${path.sep}${basename}.icns` };
    })
    .catch((err: string) => {
      console.log(`Something went wrong: ${err}`);

      return { type: 'failed', msg: err };
    });

  return result;
};
