# Elephicon

[![GitHub license](https://img.shields.io/github/license/sprout2000/elephicon)](https://github.com/sprout2000/elephicon/blob/master/LICENSE.md)
![GitHub all releases](https://img.shields.io/github/downloads/sprout2000/elephicon/total)
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

You can get _(or upgrade to)_ the latest version of _Elephicon_ via [winget](https://github.com/microsoft/winget-cli):

```sh
winget install sprout2000.Elephicon
```

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

**Special Thanks to:**

- [@vedantmgoyal2009](https://github.com/vedantmgoyal2009) [#234](https://github.com/sprout2000/elephicon/pull/234)
- [@whitebear60](https://github.com/whitebear60) [#223](https://github.com/sprout2000/elephicon/pull/223), [#225](https://github.com/sprout2000/elephicon/pull/225)
- [@aerocyber](https://github.com/aerocyber) [#163](https://github.com/sprout2000/elephicon/pull/163), [#235](https://github.com/sprout2000/elephicon/pull/235)
- [@umitseyhan75](https://github.com/umitseyhan75) [#159](https://github.com/sprout2000/elephicon/pull/159)
- [@ArcherGu](https://github.com/ArcherGu) [#151](https://github.com/sprout2000/elephicon/pull/151)
- [@LightwithoutLisonlyight](https://github.com/LightwithoutLisonlyight) [#140](https://github.com/sprout2000/elephicon/pull/140)
- [@godrix](https://github.com/godrix) [#136](https://github.com/sprout2000/elephicon/pull/136)
- [@kitt3911](https://github.com/kitt3911) [#135](https://github.com/sprout2000/elephicon/pull/135)
- [@DrDeee](https://github.com/DrDeee) [#108](https://github.com/sprout2000/elephicon/pull/108)

## :copyright: Copyright

### [png2icons](https://github.com/idesis-gmbh/png2icons)

MIT © [idesis GmbH](https://www.idesis.de), Rellinghauser Straße 334F, D-45136 Essen

### Elephicon

Copyright(c) 2020 sprout2000 and other contributors
