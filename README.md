# Elephicon

[![GitHub license](https://img.shields.io/github/license/sprout2000/elephicon)](https://github.com/sprout2000/elephicon/blob/master/LICENSE.md)
![GitHub all releases](https://img.shields.io/github/downloads/sprout2000/elephicon/total)
![GitHub contributors](https://img.shields.io/github/contributors/sprout2000/elephicon)

**Elephicon**, a GUI wrapper for [png2icons](https://github.com/idesis-gmbh/png2icons), **generates [Apple ICNS](https://en.wikipedia.org/wiki/Apple_Icon_Image_format) and [Microsoft ICO](<https://en.wikipedia.org/wiki/ICO_(file_format)>) files from PNG files.**

## :green_book: Usage

- The ideal input is a 24-bit PNG file with _1024x1024_ pixels and an alpha channel, but any other dimensions and most other PNG formats will do work.
- If you only need to create ICO files, _256×256_ pixels will be enough.
- It's also possible to create icon files from non-quadratic source PNGs.
- Various settings are available from the context menu.

<img width="50%" alt="animation" src="https://user-images.githubusercontent.com/52094761/144979888-d796c672-ee0a-44cc-bfa2-abce6513d192.gif" />

## :inbox_tray: Download

You can download the latest version of _Elephicon_ from the releases page here:  
[https://github.com/sprout2000/elephicon/releases](https://github.com/sprout2000/elephicon/releases)

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

| Language   |  Code   |
| :--------- | :-----: |
| Azərbaycan |  `az`   |
| Deutsch    |  `de`   |
| English    |  `en`   |
| Español    |  `es`   |
| Français   |  `fr`   |
| Italiano   |  `it`   |
| 日本語     |  `ja`   |
| Malayalam  |  `ml`   |
| Português  |  `pt`   |
| Русский    |  `ru`   |
| Türkçe     |  `tr`   |
| Українська |  `uk`   |
| 简体中文   | `zh_CN` |

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

2. And then please send a [pull request](https://github.com/sprout2000/elephicon/pulls) to this repository.

## :tada: Contributors

Thanks go to these wonderful people :slightly_smiling_face::

<a href="https://github.com/sprout2000/elephicon/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sprout2000/elephicon" />
</a>

## :copyright: Copyright

### [png2icons](https://github.com/idesis-gmbh/png2icons)

MIT © [idesis GmbH](https://www.idesis.de), Rellinghauser Straße 334F, D-45136 Essen

### Elephicon

Copyright(c) 2020-2026 sprout2000
