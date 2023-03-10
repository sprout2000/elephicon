# Elephicon

[![GitHub license](https://img.shields.io/github/license/sprout2000/elephicon)](https://github.com/sprout2000/elephicon/blob/master/LICENSE.md)
![GitHub all releases](https://img.shields.io/github/downloads/sprout2000/elephicon/total)
![GitHub contributors](https://img.shields.io/github/contributors/sprout2000/elephicon)
[![GitHub stars](https://img.shields.io/github/stars/sprout2000/elephicon)](https://github.com/sprout2000/elephicon/stargazers)

**Elephicon**, a GUI wrapper for [png2icons](https://github.com/idesis-gmbh/png2icons), **generates [Apple ICNS](https://en.wikipedia.org/wiki/Apple_Icon_Image_format) and [Microsoft ICO](<https://en.wikipedia.org/wiki/ICO_(file_format)>) files from PNG files.**

## :green_book: Usage

- The ideal input is a 24-bit PNG file with _1024x1024_ pixels and an alpha channel, but any other dimensions and most other PNG formats will do work.
- If you only need to create ICO files, _256×256_ pixels will be enough.
- It's also possible to create icon files from non-quadratic source PNGs.
- Various settings are available from the context menu.

<img width="50%" alt="animation" src="https://user-images.githubusercontent.com/52094761/144979888-d796c672-ee0a-44cc-bfa2-abce6513d192.gif" />

## :inbox_tray: Download

### :computer: macOS & GNU/Linux

You can download the latest version of _Elephicon_ from the releases page here:  
[https://github.com/sprout2000/elephicon/releases](https://github.com/sprout2000/elephicon/releases)

### :desktop_computer: Windows 10 & 11

Download the latest version for Windows 10 and 11 at [Microsoft Store](https://www.microsoft.com/store/apps/9P1489W92ZDQ).

<a href='https://www.microsoft.com/store/apps/9P1489W92ZDQ'><img width="160px" src='https://developer.microsoft.com/en-us/store/badges/images/English_get-it-from-MS.png' alt='Badge'/></a>

## :rainbow: Embedded Sizes

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

## :globe_with_meridians: Supported Languages (App Menu)

| Language  | Code |     | Language   |  Code   |
| :-------- | :--: | :-: | :--------- | :-----: |
| Deutsch   | `de` |     | Português  |  `pt`   |
| English   | `en` |     | Русский    |  `ru`   |
| Italiano  | `it` |     | Türkçe     |  `tr`   |
| 日本語    | `ja` |     | Українська |  `uk`   |
| Malayalam | `ml` |     | 简体中文   | `zh_CN` |

## :beers: Contributing

You can easily contribute to this repository by providing translation files.

1. Create `{your_LANG}.json` in `src/locales`.

```diff
  src
  ├── @types
  ├── createMenu.ts
  ├── locales
+ │   ├── de.json
  │   ├── en.json
  │   └── ja.json
  ├── main.ts
  ├── preload.ts
  ├── setLocales.ts
  └── web
```

2. Import the locale into `src/setLocales.ts` as follows:

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
+       de: { translation: de },
      },
    });
  };
```

3. And then please send a [pull request](https://github.com/sprout2000/elephicon/pulls) to this repository.

## :tada: Contributors

Thanks go to these wonderful people :slightly_smiling_face::

<a href="https://github.com/sprout2000/elephicon/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sprout2000/elephicon" />
</a>

## :copyright: Copyright

### [png2icons](https://github.com/idesis-gmbh/png2icons)

MIT © [idesis GmbH](https://www.idesis.de), Rellinghauser Straße 334F, D-45136 Essen

### Elephicon

Copyright(c) 2023 sprout2000 and other contributors
