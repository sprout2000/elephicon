Hello.

I made a tiny tool to generate icons (icns and ico) for desktop apps.

Please include this app in your Electron Apps repository.

Althouh your repository already has some icon makers, I think they are not so easy to use.
This app looks so simple but it's powerful, secure and easy to use.
I guess this util would be helpful for begginers to get started in Electron's world.

Best regards.

repo: https://github.com/sprout2000/gen-icns

## Output

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
