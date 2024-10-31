import fs from "node:fs";
import path from "node:path";

import { app } from "electron";
import type Store from "electron-store";

import {
  BEZIER,
  BICUBIC,
  NEAREST_NEIGHBOR,
  clearCache,
  createICNS,
  createICO,
  setLogger,
} from "png2icons";

const qualities = [NEAREST_NEIGHBOR, BICUBIC, BEZIER];

// const errorMessage = (err: string, desktop: boolean): Result => {
//   console.log(`Something went wrong: ${err}`);
//
//   return { type: "failed", log: err, desktop };
// };

export const mkico = async (
  filepath: string,
  store: Store<StoreType>,
): Promise<Result> => {
  const isDesktop = store.get("desktop", true);
  const dirname = isDesktop ? app.getPath("desktop") : path.dirname(filepath);
  const basename = path.basename(filepath, path.extname(filepath));

  const num = store.get("quality", 2);
  const bmp = store.get("bmp", true);

  return fs.promises
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
    .then((): Result => {
      clearCache();
      console.log("Successfully Completed!");

      return { type: "success", log: `${basename}.ico`, desktop: isDesktop };
    })
    .catch((err) => {
      throw err;
    });
};

export const mkicns = async (
  filepath: string,
  store: Store<StoreType>,
): Promise<Result> => {
  const isDesktop = store.get("desktop", true);
  const dirname = isDesktop ? app.getPath("desktop") : path.dirname(filepath);
  const basename = path.basename(filepath, path.extname(filepath));

  const num = store.get("quality", 2);

  return fs.promises
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
    .then((): Result => {
      clearCache();
      console.log("Successfully Completed!");

      return { type: "success", log: `${basename}.icns`, desktop: isDesktop };
    })
    .catch((err) => {
      throw err;
    });
};
