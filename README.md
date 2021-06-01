# Elephicon

**Elecphicon**, a GUI wrapper for [png2icons](https://github.com/idesis-gmbh/png2icons), **generates [Apple ICNS](https://en.wikipedia.org/wiki/Apple_Icon_Image_format) and [Microsoft ICO](<https://en.wikipedia.org/wiki/ICO_(file_format)>) files from PNG files.**

[![GitHub CI](https://github.com/sprout2000/elephicon/workflows/GitHub%20CI/badge.svg)](https://github.com/sprout2000/elephicon/actions?query=workflow%3A%22GitHub+CI%22)
[![GitHub license](https://img.shields.io/github/license/sprout2000/elephicon)](https://github.com/sprout2000/elephicon/blob/master/LICENSE.md)
![GitHub package.json dynamic](https://img.shields.io/github/package-json/keywords/sprout2000/elephicon)

## 📗 Usage

The ideal input is a 24-bit PNG file with _1024x1024_ pixels and an alpha channel, but any other dimensions and most other PNG formats will do work.

If you only need to create ICO files, _256×256_ pixels will be enough.

It's also possible to create icon files from non-quadratic source PNGs.

![elephicon2020-12-15](https://user-images.githubusercontent.com/52094761/102158835-a86b0f00-3ec5-11eb-8862-b5b6dacd0c34.gif)

## 🌈 Embedded Sizes

| Dimension  | ICO | ICNS |
| :--------- | :-: | :--: |
| 16x16      | ✅  |  ✅  |
| 16x16@2x   |     |  ✅  |
| 24x24      | ✅  |      |
| 32x32      | ✅  |  ✅  |
| 32x32@2x   |     |  ✅  |
| 48x48      | ✅  |      |
| 64x64      | ✅  |      |
| 72x72      | ✅  |      |
| 96x96      | ✅  |      |
| 128x128    | ✅  |  ✅  |
| 128x128@2x |     |  ✅  |
| 256x256    | ✅  |  ✅  |
| 256x256@2x |     |  ✅  |
| 512x512    |     |  ✅  |
| 512x512@2x |     |  ✅  |

## 📚 Supported Languages (App Menu)

| Language         | Code |
| :--------------- | :--: |
| English 🇺🇸 🇬🇧 🌐 | `en` |
| 日本語 🇯🇵        | `ja` |
| Deutsch 🇩🇪 🇨🇭 🇦🇹 | `de` |
| Русский 🇷🇺       | `ru` |
| Português 🇵🇹 🇧🇷  | `pt` |
| Italiano 🇮🇹 🇨🇭   | `it` |

## 🛠️ Build & Install

```sh
$ git clone git@github.com:sprout2000/elephicon.git
$ cd elephicon
$ npm install && npm run package
```

You will find the installer in the `release` directory.

**Note:** _You will need to have [Node.js](https://nodejs.org/en/) and [Git](https://git-scm.com/) installed._

## ✨ Download

### 💻 macOS (x64, arm64)

You can download the latest version of _Elephicon_ from the releases page here:  
[https://github.com/sprout2000/elephicon/releases](https://github.com/sprout2000/elephicon/releases)

### 🖥️ Windows10

Download the latest version for Windows10 at [Microsoft Store](https://www.microsoft.com/store/apps/9P1489W92ZDQ).

## 🍻 Contribution

I need more locale files.  
When you have translated the menu into your language, could you please send me the locale file as a [pull request](https://github.com/sprout2000/elephicon/pulls)?

1. Create `{your_LANG}.json` in `src/locales`.
2. Then import the locale file into `src/setLocales.ts` as follows:

```diff
  import en from './locales/en.json';
  import ja from './locales/ja.json';
+ import de from './locales/de.json';

 export const setLocales = (locale: string): void => {
   i18next.init({
     lng: locale,
     fallbackLng: 'en',
     resources: {
       en: { translation: en },
       ja: { translation: ja },
+      de: { translation: de },
     },
   });
 };
```

## 🎉 Contributors

**Special Thanks to:**

- [@LightwithoutLisonlyight](https://github.com/LightwithoutLisonlyight) [#140](https://github.com/sprout2000/elephicon/pull/140)
- [@godrix](https://github.com/godrix) [#136](https://github.com/sprout2000/elephicon/pull/136)
- [@kitt3911](https://github.com/kitt3911) [#135](https://github.com/sprout2000/elephicon/pull/135)
- [@DrDeee](https://github.com/DrDeee) [#108](https://github.com/sprout2000/elephicon/pull/108)

## 🏛️ License

### [png2icons](https://github.com/idesis-gmbh/png2icons)

MIT © [idesis GmbH](https://www.idesis.de), Rellinghauser Straße 334F, D-45136 Essen

### Elephicon

[MIT](https://github.com/sprout2000/lessview/blob/master/LICENSE.md) © sprout2000
