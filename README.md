# Elephicon

[![GitHub license](https://img.shields.io/github/license/sprout2000/elephicon)](https://github.com/sprout2000/elephicon/blob/main/LICENSE.md)
![GitHub all releases](https://img.shields.io/github/downloads/sprout2000/elephicon/total)
![GitHub contributors](https://img.shields.io/github/contributors/sprout2000/elephicon)

**Elephicon**, a GUI wrapper for [png2icons](https://github.com/idesis-gmbh/png2icons), **generates [Apple ICNS](https://en.wikipedia.org/wiki/Apple_Icon_Image_format) and [Microsoft ICO](<https://en.wikipedia.org/wiki/ICO_(file_format)>) files from PNG files.**

## :green_book: Usage

- The ideal input is a 24-bit PNG file with _1024x1024_ pixels and an alpha channel, but other sizes and most other PNG formats will also work.
- If you only need ICO files, _256x256_ pixels is enough.
- You can also create icons from PNG files that are not square.
- You can change the settings from the context menu.

<img width="50%" alt="animation" src="https://user-images.githubusercontent.com/52094761/144979888-d796c672-ee0a-44cc-bfa2-abce6513d192.gif" />

## :inbox_tray: Download

Download the latest version of _Elephicon_ from the [Releases page](https://github.com/sprout2000/elephicon/releases).

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

## :globe_with_meridians: Supported Languages

The app menu is available in the following languages.

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
| 简体中文   | `zh-CN` |

## :beers: Contributing

You can easily contribute to this repository by providing a translation.

1. Create `{language_code}.json` _(e.g. `nl.json`)_ in `src/locales`, based on `en.json`. It must have the same keys as `en.json`.
2. Import the file and add the language to `languages` in `src/languages.ts`.

```diff
+ import nl from "./locales/nl.json";

  export const languages: Language[] = [
    ...
+   { code: "nl", label: "Nederlands", translation: nl },
    ...
  ];
```

3. Make sure `npm run lint` and `npm test` pass _(see [Development](#wrench-development))_.
4. Send a [pull request](https://github.com/sprout2000/elephicon/pulls) to this repository.

## :tada: Contributors

Thanks to these wonderful people :slightly_smiling_face:

<a href="https://github.com/sprout2000/elephicon/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sprout2000/elephicon" />
</a>

## :hammer_and_wrench: Building from Source

You will need to have [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/) installed.

```sh
# 1. Clone this repo
git clone https://github.com/sprout2000/elephicon.git

# 2. Install dependencies
cd elephicon
npm install

# 3. Build the app and create an installer
npm run build && npm run package
```

The installer is created in the `release` directory.

## :wrench: Development

```sh
# Start the app in development mode
npm run dev

# Lint and format the code with Biome
npm run lint

# Run the tests with Vitest
npm test

# Run the tests and show the coverage
npm run test:coverage
```

The tests are in `src/__tests__/main` _(main process)_ and `src/__tests__/renderer` _(renderer process)_.

## :copyright: Copyright

### [png2icons](https://github.com/idesis-gmbh/png2icons)

MIT © [idesis GmbH](https://www.idesis.de), Rellinghauser Straße 334F, D-45136 Essen

### Elephicon

Copyright (c) 2020-present sprout2000
