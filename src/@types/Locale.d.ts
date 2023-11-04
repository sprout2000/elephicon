type Code =
  | "de"
  | "en"
  | "es"
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
