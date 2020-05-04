import fs from 'fs';
import path from 'path';

import { setLogger, createICNS, BEZIER } from 'png2icons';

interface Result {
  type: string;
  msg: string;
}

const mkicons = async (filepath: string): Promise<Result> => {
  const dirname = path.dirname(filepath);

  const result: Result = await fs.promises
    .readFile(filepath)
    .then(async (buffer) => {
      setLogger(console.log);
      const icns = createICNS(buffer, BEZIER, 0);

      await fs.promises
        .writeFile(path.join(dirname, 'icon.icns'), icns)
        .then(() => console.log(`created: ${dirname}${path.sep}icon.icns`));
    })
    .then(() => {
      console.log('Successfully Completed!');

      return { type: 'success', msg: `${dirname}${path.sep}icon.icns` };
    })
    .catch((err: string) => {
      console.log(`Something went wrong: ${err}`);

      return { type: 'failed', msg: err };
    });

  return result;
};

export default mkicons;
