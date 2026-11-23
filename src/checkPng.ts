import fs from "node:fs";

import i18next from "i18next";
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
 * PNG なら null、そうでなければ表示用のエラーメッセージを返す。
 */
export const checkPng = async (filepath: string): Promise<string | null> => {
  let isPng: boolean;

  try {
    isPng = await hasPngSignature(filepath);
  } catch (err) {
    console.log(`Failed to read: ${filepath} (${err})`);
    return i18next.t("Could not read the file");
  }

  if (isPng) return null;

  const byExtension = mime.lookup(filepath);

  if (byExtension === "image/png") {
    console.log(`Not a real PNG (spoofed extension): ${filepath}`);
    return i18next.t("Not a real PNG");
  }

  return i18next.t("Unsupported format", {
    format: byExtension || "Unknown",
    interpolation: { escapeValue: false },
  });
};
