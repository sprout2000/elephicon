import { describe, expect, it, vi } from "vitest";

import az from "../../locales/az.json";
import de from "../../locales/de.json";
import en from "../../locales/en.json";
import es from "../../locales/es.json";
import fr from "../../locales/fr.json";
import it_ from "../../locales/it.json";
import ja from "../../locales/ja.json";
import ml from "../../locales/ml.json";
import pt from "../../locales/pt.json";
import ru from "../../locales/ru.json";
import tr from "../../locales/tr.json";
import uk from "../../locales/uk.json";
import zh_CN from "../../locales/zh_cn.json";

// i18next はシングルトンなので、テストごとに新しいモジュールとして読み込む
const load = async (locale: string) => {
  vi.resetModules();

  const { default: i18next } = await import("i18next");
  const { setLocales } = await import("../../setLocales");

  setLocales(locale);
  await vi.waitFor(() => expect(i18next.isInitialized).toBe(true));

  return i18next;
};

describe("setLocales", () => {
  // createMenu.ts の言語メニューにある全コード
  it.each([
    ["az", az],
    ["de", de],
    ["en", en],
    ["es", es],
    ["fr", fr],
    ["it", it_],
    ["ja", ja],
    ["ml", ml],
    ["pt", pt],
    ["ru", ru],
    ["tr", tr],
    ["uk", uk],
    ["zh-CN", zh_CN],
  ])("translates the menu for %s", async (code, translation) => {
    const i18next = await load(code);

    expect(i18next.t("File")).toBe(translation.File);
    expect(i18next.t("Warning")).toBe(translation.Warning);
  });

  it.each([
    ["de-AT", de],
    ["en-GB", en],
    ["es-419", es],
    ["fr-CA", fr],
    ["pt-BR", pt],
    ["zh", zh_CN],
  ])(
    "maps the regional locale %s to its language",
    async (code, translation) => {
      const i18next = await load(code);

      expect(i18next.t("Settings")).toBe(translation.Settings);
    },
  );

  it("falls back to English for unknown locales", async () => {
    const i18next = await load("xx");

    expect(i18next.t("Settings")).toBe(en.Settings);
  });

  it("returns the key itself for missing translations", async () => {
    const i18next = await load("ja");

    expect(i18next.t("No such key")).toBe("No such key");
  });
});
