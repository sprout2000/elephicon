import { describe, expect, it, vi } from "vitest";

import { languages } from "../../languages";
import en from "../../locales/en.json";
import ja from "../../locales/ja.json";

// i18next はシングルトンなので、テストごとに新しいモジュールとして読み込む
const load = async (locale: string) => {
  vi.resetModules();

  const { default: i18next } = await import("i18next");
  const { setLocales } = await import("../../setLocales");

  await setLocales(locale);

  return i18next;
};

describe("setLocales", () => {
  it.each(
    languages.map(({ code, translation }) => [code, translation] as const),
  )("translates the menu for %s", async (code, translation) => {
    const i18next = await load(code);

    expect(i18next.t("File")).toBe(translation.File);
    expect(i18next.t("Warning")).toBe(translation.Warning);
  });

  it.each(
    languages.flatMap(({ aliases = [], translation }) =>
      aliases.map((alias) => [alias, translation] as const),
    ),
  )("maps the regional code %s to its language", async (code, translation) => {
    const i18next = await load(code);

    expect(i18next.t("Settings")).toBe(translation.Settings);
  });

  it("falls back to the base language of an unlisted regional code", async () => {
    const i18next = await load("ja-JP");

    expect(i18next.t("Settings")).toBe(ja.Settings);
  });

  it("falls back to English for unknown locales", async () => {
    const i18next = await load("xx");

    expect(i18next.t("Settings")).toBe(en.Settings);
  });

  it("returns the key itself for missing translations", async () => {
    const i18next = await load("ja");

    expect(i18next.t("No such key")).toBe("No such key");
  });
});
