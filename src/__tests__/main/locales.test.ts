import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const localesDir = fileURLToPath(new URL("../../locales/", import.meta.url));

const readLocale = (file: string): Record<string, unknown> =>
  JSON.parse(fs.readFileSync(path.join(localesDir, file), "utf8"));

const files = fs
  .readdirSync(localesDir)
  .filter((file) => file.endsWith(".json"))
  .sort();

const enKeys = Object.keys(readLocale("en.json")).sort();

describe("locale files", () => {
  it.each(files)("%s has the same keys as en.json", (file) => {
    expect(Object.keys(readLocale(file)).sort()).toEqual(enKeys);
  });

  it.each(files)("%s has a non-empty string for every key", (file) => {
    for (const [key, value] of Object.entries(readLocale(file))) {
      expect(typeof value, `${file}: ${key}`).toBe("string");
      expect(String(value).trim(), `${file}: ${key}`).not.toBe("");
    }
  });
});
