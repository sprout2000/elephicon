# Elephicon

[![GitHub license](https://img.shields.io/github/license/sprout2000/elephicon)](https://github.com/sprout2000/elephicon/blob/main/LICENSE.md)
![GitHub all releases](https://img.shields.io/github/downloads/sprout2000/elephicon/total)
![GitHub contributors](https://img.shields.io/github/contributors/sprout2000/elephicon)

**Elephicon generates [Apple ICNS](https://en.wikipedia.org/wiki/Apple_Icon_Image_format) and [Microsoft ICO](<https://en.wikipedia.org/wiki/ICO_(file_format)>) files from PNG, SVG and other images.** It is built with [Tauri](https://tauri.app/).

## :green_book: Usage

- Supported input formats: **PNG**, **SVG**, **JPEG**, **WebP**, **BMP**, **GIF** _(the first frame)_ and **TIFF**.
- The ideal input is an SVG file, or a PNG file with _1024x1024_ pixels and an alpha channel. Other sizes will also work.
- SVG files are drawn directly at each icon size, so small icons stay sharp. Text in an SVG file uses the fonts installed on your system.
- If you only need ICO files, _256x256_ pixels is enough.
- You can also create icons from images that are not square. They are centered on a transparent background.
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

The app menu is shown in the language of your system, if it is one of the following.

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

1. Create `{language_code}.json` _(e.g. `nl.json`)_ in `src-tauri/locales`, based on `en.json`. It must have the same keys as `en.json`.
2. Add the language to `LANGUAGES` in `src-tauri/src/i18n.rs`.

```diff
  pub const LANGUAGES: &[Language] = &[
      ...
+     Language {
+         code: "nl",
+         json: locale!("nl.json"),
+         aliases: &[],
+     },
      ...
  ];
```

3. Make sure `npm run lint`, `npm test` and `npm run test:rust` pass _(see [Development](#wrench-development))_.
4. Send a [pull request](https://github.com/sprout2000/elephicon/pulls) to this repository.

## :tada: Contributors

Thanks to these wonderful people :slightly_smiling_face:

<a href="https://github.com/sprout2000/elephicon/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sprout2000/elephicon" />
</a>

## :hammer_and_wrench: Building from Source

You will need [Node.js](https://nodejs.org/), [Git](https://git-scm.com/) and the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) _(Rust and the system dependencies)_.

```sh
# 1. Clone this repo
git clone https://github.com/sprout2000/elephicon.git

# 2. Install dependencies
cd elephicon
npm install

# 3. Build the app and create an installer and a zip file
npm run release
```

The installers are created in `src-tauri/target/release/bundle`, and the zip file in its `zip` folder:

- Windows: `Elephicon_{version}_windows_x64.zip`, with `Elephicon.exe` that runs without installing _(it needs WebView2, which comes with Windows 10 and 11)_
- macOS: `Elephicon_{version}_macos_aarch64.zip` _(or `x64`)_, with `Elephicon.app`

To build only the installers, run `npm run tauri build`. To make the zip file again from the last build, run `npm run zip`.

## :wrench: Development

```sh
# Start the app in development mode
npm run tauri dev

# Lint and format the code with Biome
npm run lint

# Check the types of the frontend
npm run typecheck

# Run the frontend tests with Vitest
npm test

# Run the frontend tests and show the coverage
npm run test:coverage

# Run the Rust tests
npm run test:rust
```

The frontend _(React)_ is in `src/web` and its tests are in `src/__tests__`. The Rust side _(conversion, menu and settings)_ is in `src-tauri/src`, with the tests next to the code.

## :copyright: Copyright

Copyright (c) 2020-present sprout2000
