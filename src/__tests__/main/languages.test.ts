import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { languages } from "../../languages";

const localesDir = fileURLToPath(new URL("../../locales/", import.meta.url));
const localeFiles = fs
  .readdirSync(localesDir)
  .filter((file) => file.endsWith(".json"));

describe("languages", () => {
  it("has no duplicated codes, including the regional ones", () => {
    const codes = languages.flatMap(({ code, aliases = [] }) => [
      code,
      ...aliases,
    ]);

    expect(new Set(codes).size).toBe(codes.length);
  });

  it("uses each translation file exactly once", async () => {
    const translations = languages.map(({ translation }) => translation);

    for (const file of localeFiles) {
      // Vite は動的 import の固定部分に拡張子がないと解決できない
      const name = path.basename(file, ".json");
      const { default: json } = await import(`../../locales/${name}.json`);

      // 新しい JSON を languages.ts に足し忘れると、ここで失敗する
      expect(translations, file).toContain(json);
    }

    expect(new Set(translations).size).toBe(translations.length);
    expect(translations).toHaveLength(localeFiles.length);
  });

  it("has a label for every language", () => {
    for (const { code, label } of languages) {
      expect(label.trim(), code).not.toBe("");
    }
  });

  it("includes English as the fallback language", () => {
    expect(languages.map(({ code }) => code)).toContain("en");
  });
});
