type Code =
  | 'de'
  | 'en'
  | 'it'
  | 'ja'
  | 'ml'
  | 'pt'
  | 'ru'
  | 'tr'
  | 'uk'
  | 'zh-CN';

declare type Locale = {
  code: Code;
  value: string;
};
