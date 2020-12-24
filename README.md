# Elephicon

**Elephicon** (A GUI Wrapper for [png2icons](https://github.com/idesis-gmbh/png2icons)) **generates [Apple ICNS](https://en.wikipedia.org/wiki/Apple_Icon_Image_format) and [Microsoft ICO](<https://en.wikipedia.org/wiki/ICO_(file_format)>) files from PNG files.**

[![GitHub CI](https://github.com/sprout2000/elephicon/workflows/GitHub%20CI/badge.svg)](https://github.com/sprout2000/elephicon/actions?query=workflow%3A%22GitHub+CI%22)
[![GitHub license](https://img.shields.io/github/license/sprout2000/elephicon)](https://github.com/sprout2000/elephicon/blob/master/LICENSE.md)
![GitHub package.json dynamic](https://img.shields.io/github/package-json/keywords/sprout2000/elephicon)

## Usage

The ideal input is a 24 bit _PNG_ with an alpha channel (RGBA) with _1024×1024_ pixels but any other dimensions and most other PNG formats do also work.

If you only need to create ICO files _256×256_ pixels are sufficient.

![elephicon2020-12-15](https://user-images.githubusercontent.com/52094761/102158835-a86b0f00-3ec5-11eb-8862-b5b6dacd0c34.gif)

## Embedded Sizes

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

## Build & Install

```
$ git clone git@github.com:sprout2000/elephicon.git
$ cd elephicon
$ yarn install && yarn package
```

You will find the installer in `release` directory.

_Note that you will need to have [Node.js](https://nodejs.org/en/), [Git](https://git-scm.com/) and [Yarn](https://yarnpkg.com/) installed._

## Download

### macOS (x64, arm64)

You can download the latest version of _Elephicon_ from the releases page here:  
[https://github.com/sprout2000/elephicon/releases](https://github.com/sprout2000/elephicon/releases)

### Windows10

Download the latest version for Windows10 at [Microsoft Store](https://www.microsoft.com/store/apps/9P1489W92ZDQ).

## Contribution

I need more locale files.  
When you translate the menu into your language, please send me the locale file as a pull request.

- Create `{your_LANG}.json` in `src/locales`.
- And then add your locale to `src/setLocales.ts` like:

```diff
  import en from './locales/en.json';
  import ja from './locales/ja.json';
+ import cs from './locales/cs.json';

 export const setLocales = (locale: string): void => {
   i18next.init({
     lng: locale,
     fallbackLng: 'en',
     resources: {
       en: { translation: en },
       ja: { translation: ja },
+      cs: { translation: cs },
     },
   });
 };
```

## License

### [png2icons](https://github.com/idesis-gmbh/png2icons)

MIT © [idesis GmbH](https://www.idesis.de), Rellinghauser Straße 334F, D-45136 Essen

### Elephicon

[MIT](https://github.com/sprout2000/lessview/blob/master/LICENSE.md) © sprout2000
