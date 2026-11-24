import fs from "node:fs";

import mime from "mime-types";

// すべての PNG ファイルの先頭に置かれる 8 バイトのシグネチャ
const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

export const hasPngSignature = async (filepath: string): Promise<boolean> => {
  const fh = await fs.promises.open(filepath, "r");

  try {
    const buf = Buffer.alloc(PNG_SIGNATURE.length);
    const { bytesRead } = await fh.read(buf, 0, buf.length, 0);

    return bytesRead === buf.length && buf.equals(PNG_SIGNATURE);
  } finally {
    await fh.close();
  }
};

/**
 * ファイルの中身が PNG かどうかを調べる。
 * PNG なら null、そうでなければウィンドウに表示するエラーメッセージ（英語）を返す。
 */
export const checkPng = async (filepath: string): Promise<string | null> => {
  let isPng: boolean;

  try {
    isPng = await hasPngSignature(filepath);
  } catch (err) {
    console.log(`Failed to read: ${filepath} (${err})`);
    return "Could not read the file.";
  }

  if (isPng) return null;

  const byExtension = mime.lookup(filepath);

  if (byExtension === "image/png") {
    console.log(`Not a real PNG (spoofed extension): ${filepath}`);
    return "This file has a .png extension, but it is not a PNG image.";
  }

  return `Unsupported format: ${byExtension || "Unknown"}`;
};
