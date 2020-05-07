# ![icon64](https://user-images.githubusercontent.com/52094761/81348668-7573c800-90f9-11ea-9fe9-7fd3c92d14a1.png) GenICNS

GenICNS (GUI Wrapper for [png2icons](https://github.com/idesis-gmbh/png2icons)) generates [Apple ICNS](https://en.wikipedia.org/wiki/Apple_Icon_Image_format) and [Microsoft ICO](https://en.wikipedia.org/wiki/ICO_(file_format)) files from PNG files.

[![GitHub CI](https://github.com/sprout2000/gen-icns/workflows/GitHub%20CI/badge.svg)](https://github.com/sprout2000/gen-icns/actions?query=workflow%3A%22GitHub+CI%22)
[![GitHub license](https://img.shields.io/github/license/sprout2000/gen-icns)](https://github.com/sprout2000/gen-icns/blob/master/LICENSE.md)
![GitHub package.json dynamic](https://img.shields.io/github/package-json/keywords/sprout2000/gen-icns)

<img width="512" alt="2020-05-02 14 56 28" src="https://user-images.githubusercontent.com/52094761/80856508-92397700-8c85-11ea-9536-63387c6c9ab6.png">

## Usage

The ideal input is a 24 bit *PNG* with an alpha channel (RGBA) with *1024×1024* pixels but any other dimensions and most other PNG formats do also work. 

If you only need to create ICO files *256×256* pixels are sufficient. 

![result4](https://user-images.githubusercontent.com/52094761/81348809-c5528f00-90f9-11ea-88e5-751139d32ea9.gif)

*Note: Both of the outputs (ICO, ICNS) will be created with multiple sizes embedded.*

## Build & Install

1. Clone this repo:

```
$ git clone git@github.com:sprout2000/gen-icns.git
```

2. Install dependencies...

```
$ cd gen-icns
$ yarn install
```

3. Build installers and you will find the installer in `release` directory.

```
$ yarn package
```

*Note that you will need to have [Node.js](https://nodejs.org/en/), [Git](https://git-scm.com/) and [Yarn](https://yarnpkg.com/) installed.*

## Download

You can download the latest version of GenICNS from the releases page here:  
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

### GenICNS

[MIT](https://github.com/sprout2000/lessview/blob/master/LICENSE.md) © Office Nishigami
