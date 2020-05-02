# ![icon64](https://user-images.githubusercontent.com/52094761/80297794-80f1f580-87c1-11ea-9726-39fa0efe9581.png) GenICNS

ICNS Generator (GUI Wrapper for [idesis-gmbh/png2icons](https://github.com/idesis-gmbh/png2icons)) to generate desktop app icons (icns and ico) from a PNG.

[![GitHub CI](https://github.com/sprout2000/gen-icns/workflows/GitHub%20CI/badge.svg)](https://github.com/sprout2000/gen-icns/actions?query=workflow%3A%22GitHub+CI%22)
[![GitHub license](https://img.shields.io/github/license/sprout2000/gen-icns)](https://github.com/sprout2000/gen-icns/blob/master/LICENSE.md)
![GitHub package.json dynamic](https://img.shields.io/github/package-json/keywords/sprout2000/gen-icns)

<img width="512" alt="2020-05-02 10 24 26" src="https://user-images.githubusercontent.com/52094761/80851880-4d9ae500-8c5f-11ea-8794-d2ad95e8a34d.png">


## Usage

Drop a PNG file to the window, and you will see `icon-xxxxxxxxx` created in the directory.

The ideal input is a 24 bit PNG with an alpha channel (RGBA) with 1024×1024 pixels but any other dimensions and most other PNG formats do also work. 

## Output Formats

Output | Dimension | Platform | Algorithm | Multiple
:--- | :--- | :--- | :---: | :---:
icon.icns | 1024x1024 | macOS | Bicubic | true
icon.ico | 256x256 | Windows | Bicubic | true

### ICNS

Dimension | OSType | Size | DPI
:--- | :--- | :--- | ---:
16 | s8mk, is32 | 16x16 | 72
32 | l8mk, il32 | 32x32 | 72
128 | ic07 | 128x128 | 72
256 | ic08 | 256x256 | 72
512 | ic09 | 512x512 | 72
16@2x | ic11 | 32x32 | 144
32@2x | ic12 | 64x64 | 144
128@2x | ic13 | 256x256 | 144
256@2x | ic14 | 512x512 | 144
512@2x | ic10 | 1024x1024 | 144

### ICO

Dimension | Format
:---: | :---:
16 | BMP
24 | BMP
32 | BMP
48 | BMP
64 | PNG
72 | PNG
96 | PNG
128 | PNG
256 | PNG

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

## Auto Update (*macOS*)

<img width="512" alt="2020-05-02 10 30 43" src="https://user-images.githubusercontent.com/52094761/80852018-1aa52100-8c60-11ea-8894-ab20b28745f7.png">

## License

### [png2icons](https://github.com/idesis-gmbh/png2icons)

MIT © [idesis GmbH](https://www.idesis.de), Rellinghauser Straße 334F, D-45136 Essen

### GenICNS

[MIT](https://github.com/sprout2000/lessview/blob/master/LICENSE.md) © Office Nishigami
