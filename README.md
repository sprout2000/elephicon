# Elephicon

**Elephicon**, a GUI wrapper for [png2icons](https://github.com/idesis-gmbh/png2icons), **generates [Apple ICNS](https://en.wikipedia.org/wiki/Apple_Icon_Image_format) and [Microsoft ICO](<https://en.wikipedia.org/wiki/ICO_(file_format)>) files from PNG files.**

[![GitHub CI](https://github.com/sprout2000/elephicon/actions/workflows/release.yml/badge.svg)](https://github.com/sprout2000/elephicon/actions/workflows/release.yml)
[![GitHub license](https://img.shields.io/github/license/sprout2000/elephicon)](https://github.com/sprout2000/elephicon/blob/master/LICENSE.md)
![GitHub all releases](https://img.shields.io/github/downloads/sprout2000/elephicon/total)
[![GitHub stars](https://img.shields.io/github/stars/sprout2000/elephicon)](https://github.com/sprout2000/elephicon/stargazers)
[![Twitter](https://img.shields.io/twitter/url?style=flat-square&url=https%3A%2F%2Fgithub.com%2Fsprout2000%2Felephicon)](https://twitter.com/intent/tweet?text=Wow:&url=https%3A%2F%2Fgithub.com%2Fsprout2000%2Felephicon)

## :green_book: Usage

The ideal input is a 24-bit PNG file with _1024x1024_ pixels and an alpha channel, but any other dimensions and most other PNG formats will do work.

If you only need to create ICO files, _256×256_ pixels will be enough.

It's also possible to create icon files from non-quadratic source PNGs.

<img width="50%" alt="animation" src="https://user-images.githubusercontent.com/52094761/144979888-d796c672-ee0a-44cc-bfa2-abce6513d192.gif" />

## :gift: Download

### :desktop_computer: macOS (x64, arm64)

You can download the latest version of _Elephicon_ from the releases page here:  
[https://github.com/sprout2000/elephicon/releases](https://github.com/sprout2000/elephicon/releases)

### :computer: Windows10, 11

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

## :books: Supported Languages (App Menu)

| Language                           |  Code   |
| :--------------------------------- | :-----: |
| English :us: :uk: :earth_americas: |  `en`   |
| 日本語 :jp:                        |  `ja`   |
| Deutsch :de:                       |  `de`   |
| Русский :ru:                       |  `ru`   |
| Português :portugal: :brazil:      |  `pt`   |
| Italiano :it:                      |  `it`   |
| 简体中文 :cn:                      | `zh_CN` |
| Türkçe :tr:                        |  `tr`   |
| Malayalam :india:                  |  `ml`   |

## :closed_lock_with_key: Security

| API                     | Value              |
| :---------------------- | :----------------- |
| Content-Security-Policy | `default-src self` |
| nodeIntegration         | `false`            |
| enableRemoteModule      | `false`            |
| contextIsolation        | `true`             |
| safeDialogs             | `true`             |
| sandbox                 | `true`             |

## :tada: Contributors

**Special Thanks to:**

- [@aerocyber](https://github.com/aerocyber) [#163](https://github.com/sprout2000/elephicon/pull/163)
- [@umitseyhan75](https://github.com/umitseyhan75) [#159](https://github.com/sprout2000/elephicon/pull/159)
- [@ArcherGu](https://github.com/ArcherGu) [#151](https://github.com/sprout2000/elephicon/pull/151)
- [@LightwithoutLisonlyight](https://github.com/LightwithoutLisonlyight) [#140](https://github.com/sprout2000/elephicon/pull/140)
- [@godrix](https://github.com/godrix) [#136](https://github.com/sprout2000/elephicon/pull/136)
- [@kitt3911](https://github.com/kitt3911) [#135](https://github.com/sprout2000/elephicon/pull/135)
- [@DrDeee](https://github.com/DrDeee) [#108](https://github.com/sprout2000/elephicon/pull/108)

## :vertical_traffic_light: Privacy Policy

- Elephicon and the developer do NOT collect any personal information or privacy-related information about the user.
- Elephicon and the developer do NOT collect the information of files opened by Elephicon.

## :copyright: License

### [png2icons](https://github.com/idesis-gmbh/png2icons)

MIT © [idesis GmbH](https://www.idesis.de), Rellinghauser Straße 334F, D-45136 Essen

### Elephicon

Copyright(c) 2020 sprout2000 and other contributors  
[MIT](https://github.com/sprout2000/elephicon/blob/master/LICENSE.md) Licensed
