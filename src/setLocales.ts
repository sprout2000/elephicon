import i18next from 'i18next';

import template from './locales/template.json';

import enUS from './locales/en_US.json';
import ja from './locales/ja.json';
/** Merge the pull request sent by DrDeee. */
/** https://github.com/sprout2000/elephicon/pull/108 */
import de from './locales/de.json';
/** Merge the pull request sent by kitt3911. */
/** https://github.com/sprout2000/elephicon/pull/135 */
import ru from './locales/ru.json';
/** Merge the pull request sent by godrix. */
/** https://github.com/sprout2000/elephicon/pull/136 */
import ptBR from './locales/pt_BR.json';

export const setLocales = (locale: string): void => {
  i18next.init({
    lng: locale,
    fallbackLng: 'en',
    resources: {
      en: { translation: template },
      'en-US': { translation: enUS },
      ja: { translation: ja },
      de: { translation: de },
      ru: { translation: ru },
      'pt-BR': { translation: ptBR },
    },
  });
};
