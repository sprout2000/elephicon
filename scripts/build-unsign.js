const builder = require('electron-builder');

builder
  .build({
    config: {
      productName: 'Elephicon',
      copyright: 'Copyright (C) 2020 sprout2000.',
      files: ['dist/**/*'],
      directories: {
        output: 'release',
      },
      asar: true,
      asarUnpack: ['dist/preload.js'],
      mac: {
        category: 'public.app-category.developer-tools',
        artifactName: '${productName}-${version}-x64.${ext}',
        target: ['dmg'],
        icon: 'assets/icon.icns',
        extendInfo: {
          CFBundleName: 'Elephicon',
          CFBundleDisplayName: 'Elephicon',
          CFBundleExecutable: 'Elephicon',
          CFBundlePackageType: 'APPL',
          CFBundleDocumentTypes: [
            {
              CFBundleTypeName: 'ImageFile',
              CFBundleTypeRole: 'Viewer',
              LSItemContentTypes: ['public.png'],
              LSHandlerRank: 'Default',
            },
          ],
          NSRequiresAquaSystemAppearance: false,
        },
      },
      dmg: {
        icon: 'assets/dmg.icns',
      },
      win: {
        artifactName: '${productName}-${version}-x64.${ext}',
        icon: 'assets/icon.ico',
        target: ['nsis'],
        publisherName: 'sprout2000',
        fileAssociations: [
          {
            ext: ['png'],
            description: 'Image files',
          },
        ],
      },
      nsis: {
        oneClick: false,
        perMachine: false,
        createDesktopShortcut: false,
        createStartMenuShortcut: true,
        installerIcon: 'assets/installerIcon.ico',
        artifactName: '${productName}-${version}-x64-installer.${ext}',
      },
    },
  })
  .catch((err) => console.log(err));
