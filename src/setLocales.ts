import i18next from 'i18next';

import en from './locales/en.json';
import ja from './locales/ja.json';
/** Merge the pull request sent by DrDeee. */
/** https://github.com/sprout2000/elephicon/pull/108 */
import de from './locales/de.json';
/** Merge the pull request sent by kitt3911. */
/** https://github.com/sprout2000/elephicon/pull/135 */
import ru from './locales/ru.json';
/** Merge the pull request sent by godrix. */
/** https://github.com/sprout2000/elephicon/pull/136 */
import pt from './locales/pt.json';
/** Merge the pull request sent by LightwithoutLisonlyight. */
/** https://github.com/sprout2000/elephicon/pull/140 */
import it from './locales/it.json';
/** Merge the pull request sent by ArcherGu. */
/** https://github.com/sprout2000/elephicon/pull/151 */
import zh_CN from './locales/zh_cn.json';
/** Merge the pull request sent by umitseyhan75 */
/** https://github.com/sprout2000/elephicon/pull/159 */
import tr from './locales/tr.json';
/** Merge the pull request sent by aerocyber */
/** https://github.com/sprout2000/elephicon/pull/163 */
import ml from './locales/ml.json';
/** Merge the pull request sent by whitebear60 */
/** https://github.com/sprout2000/elephicon/pull/223 */
import uk from './locales/uk.json';

export const setLocales = (locale: string) => {
  i18next.init({
    lng: locale,
    fallbackLng: 'en',
    /** see https://source.chromium.org/chromium/chromium/src/+/main:ui/base/l10n/l10n_util.cc */
    resources: {
      de: { translation: de },
      'de-AT': { translation: de },
      'de-CH': { translation: de },
      'de-DE': { translation: de },
      'de-LI': { translation: de },
      en: { translation: en },
      'en-AU': { translation: en },
      'en-CA': { translation: en },
      'en-GB': { translation: en },
      'en-IN': { translation: en },
      'en-NZ': { translation: en },
      'en-US': { translation: en },
      'en-ZA': { translation: en },
      it: { translation: it },
      'it-CH': { translation: it },
      'it-IT': { translation: it },
      ja: { translation: ja },
      ml: { translation: ml },
      pt: { translation: pt },
      'pt-BR': { translation: pt },
      'pt-PT': { translation: pt },
      ru: { translation: ru },
      tr: { translation: tr },
      uk: { translation: uk },
      zh: { translation: zh_CN },
      'zh-CN': { translation: zh_CN },
    },
  });
};
