# GenIcons

[![GitHub CI](https://github.com/sprout2000/gen-icns/workflows/GitHub%20CI/badge.svg)](https://github.com/sprout2000/gen-icns/actions?query=workflow%3A%22GitHub+CI%22)
[![GitHub license](https://img.shields.io/github/license/sprout2000/gen-icns)](https://github.com/sprout2000/gen-icns/blob/master/LICENSE.md)
![GitHub package.json dynamic](https://img.shields.io/github/package-json/keywords/sprout2000/gen-icns)

**GenIcons** (GUI Wrapper for [png2icons](https://github.com/idesis-gmbh/png2icons)) **generates [Apple ICNS](https://en.wikipedia.org/wiki/Apple_Icon_Image_format) and [Microsoft ICO](https://en.wikipedia.org/wiki/ICO_(file_format)) files from PNG files.**

## Usage

The ideal input is a 24 bit *PNG* with an alpha channel (RGBA) with *1024×1024* pixels but any other dimensions and most other PNG formats do also work. 

If you only need to create ICO files *256×256* pixels are sufficient. 

![result](https://user-images.githubusercontent.com/52094761/82133577-d0f43300-9828-11ea-946d-b34cc2fe429e.gif)

## Embedded Sizes

| Dimension | ICO | ICNS |
| :--- | :---: | :---: |
| 16x16 | ✅ | ✅ |
| 16x16@2x | | ✅ |
| 24x24 | ✅ | |
| 32x32 | ✅ | ✅ |
| 32x32@2x | | ✅ |
| 48x48 | ✅ | |
| 64x64 | ✅ | |
| 72x72 | ✅ | |
| 96x96 | ✅ | |
| 128x128 | ✅ | ✅ |
| 128x128@2x | | ✅ |
| 256x256 | ✅ | ✅ |
| 256x256@2x | | ✅ |
| 512x512 | | ✅ |
| 512x512@2x | | ✅ |

## Build & Install

```
$ git clone git@github.com:sprout2000/gen-icns.git
$ cd gen-icns
$ yarn install && yarn package
```

You will find the installer in `release` directory.

*Note that you will need to have [Node.js](https://nodejs.org/en/), [Git](https://git-scm.com/) and [Yarn](https://yarnpkg.com/) installed.*

## Download

You can download the latest version of GenIcons from the releases page here:  
[https://github.com/sprout2000/gen-icns/releases](https://github.com/sprout2000/gen-icns/releases)

## Security

API | Boolean
:--- | :---
nodeIntegration | `false`
enableRemoteModule | `false`
contextIsolation | `true`
safeDialogs | `true`
sandbox | `true`

## License

### [png2icons](https://github.com/idesis-gmbh/png2icons)

MIT © [idesis GmbH](https://www.idesis.de), Rellinghauser Straße 334F, D-45136 Essen

### GenIcons

[MIT](https://github.com/sprout2000/lessview/blob/master/LICENSE.md) © Office Nishigami
