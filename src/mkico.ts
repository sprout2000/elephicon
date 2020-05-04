import fs from 'fs';
import path from 'path';

import { setLogger, createICO, BEZIER } from 'png2icons';

interface Result {
  type: string;
  msg: string;
}

const mkico = async (filepath: string): Promise<Result> => {
  const dirname = path.dirname(filepath);

  const result: Result = await fs.promises
    .readFile(filepath)
    .then(async (buffer) => {
      setLogger(console.log);
      const ico = createICO(buffer, BEZIER, 0, false, true);

      await fs.promises
        .writeFile(path.join(dirname, 'icon.ico'), ico)
        .then(() => console.log(`created: ${dirname}${path.sep}icon.ico`));
    })
    .then(() => {
      console.log('Successfully Completed!');

      return { type: 'success', msg: `${dirname}${path.sep}icon.ico` };
    })
    .catch((err: string) => {
      console.log(`Something went wrong: ${err}`);

      return { type: 'failed', msg: err };
    });

  return result;
};

export default mkico;
