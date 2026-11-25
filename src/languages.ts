// Credits for each translation are kept next to its import.
import az from "./locales/az.json"; // https://github.com/sprout2000/elephicon/pull/241 by thepoladov13
import de from "./locales/de.json"; // https://github.com/sprout2000/elephicon/pull/108 by DrDeee
import en from "./locales/en.json";
import es from "./locales/es.json"; // https://github.com/sprout2000/elephicon/pull/240 by kant
import fr from "./locales/fr.json"; // https://github.com/sprout2000/elephicon/issues/243 by logounet
import it from "./locales/it.json"; // https://github.com/sprout2000/elephicon/pull/140 by LightwithoutLisonlyight
import ja from "./locales/ja.json";
import ml from "./locales/ml.json"; // https://github.com/sprout2000/elephicon/pull/163 by aerocyber
import pt from "./locales/pt.json"; // https://github.com/sprout2000/elephicon/pull/136 by godrix
import ru from "./locales/ru.json"; // https://github.com/sprout2000/elephicon/pull/135 by kitt3911
import tr from "./locales/tr.json"; // https://github.com/sprout2000/elephicon/pull/159 by umitseyhan75
import uk from "./locales/uk.json"; // https://github.com/sprout2000/elephicon/pull/223 by whitebear60
import zh_CN from "./locales/zh_cn.json"; // https://github.com/sprout2000/elephicon/pull/151 by ArcherGu

export type Language = {
  /** The language code used by i18next and saved in the settings. */
  code: string;
  /** The name shown in the Language menu. */
  label: string;
  translation: Record<string, string>;
  /**
   * Regional codes that use the same translation (e.g. "de-AT"), following
   * https://source.chromium.org/chromium/chromium/src/+/main:ui/base/l10n/l10n_util.cc
   */
  aliases?: string[];
};

/**
 * The languages Elephicon is translated into, in the order of the Language
 * menu. To add a language, create src/locales/{code}.json and add it here.
 */
export const languages: Language[] = [
  { code: "az", label: "Azərbaycan", translation: az },
  {
    code: "de",
    label: "Deutsch",
    translation: de,
    aliases: ["de-AT", "de-CH", "de-DE", "de-LI"],
  },
  {
    code: "en",
    label: "English",
    translation: en,
    aliases: ["en-AU", "en-CA", "en-GB", "en-IN", "en-NZ", "en-US", "en-ZA"],
  },
  {
    code: "es",
    label: "Español",
    translation: es,
    aliases: [
      "es-419",
      "es-AR",
      "es-CL",
      "es-CO",
      "es-CR",
      "es-ES",
      "es-HN",
      "es-MX",
      "es-PE",
      "es-US",
      "es-UY",
      "es-VE",
    ],
  },
  {
    code: "fr",
    label: "Français",
    translation: fr,
    aliases: ["fr-CA", "fr-CH", "fr-FR"],
  },
  {
    code: "it",
    label: "Italiano",
    translation: it,
    aliases: ["it-CH", "it-IT"],
  },
  { code: "ja", label: "日本語", translation: ja },
  { code: "ml", label: "Malayalam", translation: ml },
  {
    code: "pt",
    label: "Português",
    translation: pt,
    aliases: ["pt-BR", "pt-PT"],
  },
  { code: "ru", label: "Русский", translation: ru },
  { code: "tr", label: "Türkçe", translation: tr },
  { code: "uk", label: "Українська", translation: uk },
  {
    code: "zh-CN",
    label: "简体中文",
    translation: zh_CN,
    aliases: ["zh"],
  },
];
