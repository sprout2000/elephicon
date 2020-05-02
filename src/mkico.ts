import fs from 'fs';
import path from 'path';

import { setLogger, createICO, BEZIER } from 'png2icons';

interface Result {
  type: string;
  msg: string;
}

const mkico = async (filepath: string): Promise<Result> => {
  const dirname = path.dirname(filepath);
  const hash = new Date().getTime().toString();
  const dest = path.join(dirname, `icons-${hash}`);

  const result: Result = await fs.promises
    .mkdir(dest)
    .then(async () => {
      console.log(`created: ${dest}`);

      const success: Result = await fs.promises
        .readFile(filepath)
        .then(async (buffer) => {
          setLogger(console.log);
          const ico = createICO(buffer, BEZIER, 0, false, true);

          await fs.promises
            .writeFile(path.join(dest, 'icon.ico'), ico)
            .then(() => console.log(`created: ${dest}${path.sep}icon.ico`));
        })
        .then(() => {
          console.log('Successfully Completed!');

          return { type: 'success', msg: `${dest}${path.sep}icon.ico` };
        });

      return success;
    })
    .catch((err: string) => {
      console.log(`Something went wrong: ${err}`);

      return { type: 'failed', msg: err };
    });

  return result;
};

export default mkico;
