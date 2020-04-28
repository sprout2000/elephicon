# ![icon64](https://user-images.githubusercontent.com/52094761/80297794-80f1f580-87c1-11ea-9726-39fa0efe9581.png) GenICNS

ICNS Generator (GUI Wrapper for [idesis-gmbh/png2icons](https://github.com/idesis-gmbh/png2icons)) to generate desktop app icons (icns and ico) from a PNG.

[![GitHub CI](https://github.com/sprout2000/gen-icns/workflows/GitHub%20CI/badge.svg)](https://github.com/sprout2000/gen-icns/actions?query=workflow%3A%22GitHub+CI%22)
[![GitHub license](https://img.shields.io/github/license/sprout2000/gen-icns)](https://github.com/sprout2000/gen-icns/blob/master/LICENSE.md)
![GitHub package.json dynamic](https://img.shields.io/github/package-json/keywords/sprout2000/gen-icns)

<img width="512" alt="2020-04-29 7 38 10" src="https://user-images.githubusercontent.com/52094761/80545494-6b154800-89ee-11ea-98a0-7983496f240a.png">


## Usage

Drop a PNG file to the window, and you will see `icon-xxxxxxxxx` created in the directory.

The ideal input is a 24 bit PNG with an alpha channel (RGBA) with 1024×1024 pixels but any other dimensions and most other PNG formats do also work. 

Outputs | Dimensions | Platform | Multiple sizes
:--- | :---: | :---: | :---
icon.icns | 1024x1024 | macOS | 16, 16@2x, 32, 32@2x, 128, 128@2x, 256, 256@2x, 512, 512@2x
icon.ico | 256x256 | Windows | 16, 24, 32, 48, 64, 72, 96, 128, 256

## Security

API | Boolean
:--- | :---
nodeIntegration | `false`
enableRemoteModule | `false`
contextIsolation | `true`
safeDialogs | `true`
sandbox | `true`

## How to build and install

1. Clone this repo

```
$ git clone git@github.com:sprout2000/gen-icns.git
```

2. Install the dependencies...

```
$ cd gen-icns
$ npm install
```

3. ...then start to build the installer, and you'll find the intaller in `release` directory.

```
$ npm run package
```

*Note that you will need to have [Node.js](https://nodejs.org/en/) and [Git](https://git-scm.com/) installed.*

## Download

You can also download binary packages for macOS (signed & notarized) at [releases](https://github.com/sprout2000/gen-icns/releases).


## License

### [png2icons](https://github.com/idesis-gmbh/png2icons)

MIT © [idesis GmbH](https://www.idesis.de), Rellinghauser Straße 334F, D-45136 Essen

### GenICNS

[MIT](https://github.com/sprout2000/lessview/blob/master/LICENSE.md) © Office Nishigami
