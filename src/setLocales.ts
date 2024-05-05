import i18next from "i18next";

import az from "./locales/az.json"; // https://github.com/sprout2000/elephicon/pull/241 by thepoladov13
import de from "./locales/de.json"; // https://github.com/sprout2000/elephicon/pull/108 by DrDeee
import en from "./locales/en.json";
import es from "./locales/es.json"; // https://github.com/sprout2000/elephicon/pull/240 by kant
import it from "./locales/it.json"; // https://github.com/sprout2000/elephicon/pull/140 by LightwithoutLisonlyight
import ja from "./locales/ja.json";
import ml from "./locales/ml.json"; // https://github.com/sprout2000/elephicon/pull/163 by aerocyber
import pt from "./locales/pt.json"; // https://github.com/sprout2000/elephicon/pull/136 by godrix
import tr from "./locales/tr.json"; // https://github.com/sprout2000/elephicon/pull/159 by umitseyhan75
import ru from "./locales/ru.json"; // https://github.com/sprout2000/elephicon/pull/135 by kitt3911
import uk from "./locales/uk.json"; // https://github.com/sprout2000/elephicon/pull/223 by whitebear60
import zh_CN from "./locales/zh_cn.json"; // https://github.com/sprout2000/elephicon/pull/151 by ArcherGu

export const setLocales = (locale: string) => {
  i18next.init({
    lng: locale,
    fallbackLng: "en",
    // https://source.chromium.org/chromium/chromium/src/+/main:ui/base/l10n/l10n_util.cc
    resources: {
      az: { translation: az },
      de: { translation: de },
      "de-AT": { translation: de },
      "de-CH": { translation: de },
      "de-DE": { translation: de },
      "de-LI": { translation: de },
      en: { translation: en },
      "en-AU": { translation: en },
      "en-CA": { translation: en },
      "en-GB": { translation: en },
      "en-IN": { translation: en },
      "en-NZ": { translation: en },
      "en-US": { translation: en },
      "en-ZA": { translation: en },
      es: { translation: es },
      "es-419": { translation: es },
      "es-AR": { translation: es },
      "es-CL": { translation: es },
      "es-CO": { translation: es },
      "es-CR": { translation: es },
      "es-ES": { translation: es },
      "es-HN": { translation: es },
      "es-MX": { translation: es },
      "es-PE": { translation: es },
      "es-US": { translation: es },
      "es-UY": { translation: es },
      "es-VE": { translation: es },
      it: { translation: it },
      "it-CH": { translation: it },
      "it-IT": { translation: it },
      ja: { translation: ja },
      ml: { translation: ml },
      pt: { translation: pt },
      "pt-BR": { translation: pt },
      "pt-PT": { translation: pt },
      ru: { translation: ru },
      tr: { translation: tr },
      uk: { translation: uk },
      zh: { translation: zh_CN },
      "zh-CN": { translation: zh_CN },
    },
  });
};
