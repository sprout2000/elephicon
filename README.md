# ![icon64](https://user-images.githubusercontent.com/52094761/80297794-80f1f580-87c1-11ea-9726-39fa0efe9581.png) GenICNS

GenICNS (GUI Wrapper for [png2icons](https://github.com/idesis-gmbh/png2icons)) generates [Apple ICNS](https://en.wikipedia.org/wiki/Apple_Icon_Image_format) and [Microsoft ICO](https://en.wikipedia.org/wiki/ICO_(file_format)) files from PNG files.

[![GitHub CI](https://github.com/sprout2000/gen-icns/workflows/GitHub%20CI/badge.svg)](https://github.com/sprout2000/gen-icns/actions?query=workflow%3A%22GitHub+CI%22)
[![GitHub license](https://img.shields.io/github/license/sprout2000/gen-icns)](https://github.com/sprout2000/gen-icns/blob/master/LICENSE.md)
![GitHub package.json dynamic](https://img.shields.io/github/package-json/keywords/sprout2000/gen-icns)

<img width="512" alt="2020-05-02 14 56 28" src="https://user-images.githubusercontent.com/52094761/80856508-92397700-8c85-11ea-9536-63387c6c9ab6.png">


## Usage

The ideal input is a 24 bit PNG with an alpha channel (RGBA) with 1024×1024 pixels but any other dimensions and most other PNG formats do also work. 

If you only need to create ICO files 256×256 pixels are sufficient. 

## Output Formats

Output | Dimension | Platform | Algorithm | Multiple Sizes
:--- | :--- | :--- | :---: | :---:
icon.icns | 1024x1024 | macOS | Bezier | true
icon.ico | 256x256 | Windows | Bezier | true

## Security

API | Boolean
:--- | :---
nodeIntegration | `false`
enableRemoteModule | `false`
contextIsolation | `true`
safeDialogs | `true`
sandbox | `true`

<!-- ## How to build and install

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

*Note that you will need to have [Node.js](https://nodejs.org/en/) and [Git](https://git-scm.com/) installed.* -->

## Download

You can also download binary packages for macOS (signed & notarized) at the [releases](https://github.com/sprout2000/gen-icns/releases) section.

## License

### [png2icons](https://github.com/idesis-gmbh/png2icons)

MIT © [idesis GmbH](https://www.idesis.de), Rellinghauser Straße 334F, D-45136 Essen

### GenICNS

[MIT](https://github.com/sprout2000/lessview/blob/master/LICENSE.md) © Office Nishigami
