Hello.

I made a tiny tool to generate icons (icns and ico) for desktop apps.

Please include this app in your Electron Apps repository.

Althouh your repository already has some icon makers, I think they are not so easy to use.
This app looks so simple but it's powerful, secure and easy to use.
I guess this utility would be helpful for begginers to get started in Electron's world.

Best regards.

repo: https://github.com/sprout2000/gen-icns

## Output Formats

Output | Dimension | Platform | Algorithm | Multiple
:--- | :--- | :--- | :---: | :---:
icon.icns | 1024x1024 | macOS | Bicubic | true
icon.ico | 256x256 | Windows | Bicubic | true

## Security

API | Boolean
:--- | :---
nodeIntegration | `false`
enableRemoteModule | `false`
contextIsolation | `true`
safeDialogs | `true`
sandbox | `true`
