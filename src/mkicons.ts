import fs from 'fs';
import path from 'path';

import { setLogger, createICO, createICNS, BEZIER } from 'png2icons';

interface Result {
  type: string;
  msg: string;
}

export const mkico = async (filepath: string): Promise<Result> => {
  const dirname = path.dirname(filepath);
  const basename = path.basename(filepath, path.extname(filepath));

  const result: Result = await fs.promises
    .readFile(filepath)
    .then(async (buffer) => {
      setLogger(console.log);
      const ico = createICO(buffer, BEZIER, 0, false, true);

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

export const mkicns = async (filepath: string): Promise<Result> => {
  const dirname = path.dirname(filepath);
  const basename = path.basename(filepath, path.extname(filepath));

  const result: Result = await fs.promises
    .readFile(filepath)
    .then(async (buffer) => {
      setLogger(console.log);
      const icns = createICNS(buffer, BEZIER, 0);

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
