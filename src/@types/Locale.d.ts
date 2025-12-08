type Code =
  | "az"
  | "de"
  | "en"
  | "es"
  | "fr"
  | "it"
  | "ja"
  | "ml"
  | "pt"
  | "ru"
  | "tr"
  | "uk"
  | "zh-CN";

declare type Locale = {
  code: Code;
  value: string;
};
