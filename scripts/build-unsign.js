const builder = require('electron-builder');

const os = require('os');
const arch = os.arch();
const isSur = os.platform() === 'darwin' && parseInt(os.release()) >= 20;

builder
  .build({
    config: {
      productName: 'Elephicon',
      artifactName:
        '${productName}-${version}-${platform}-' + `${arch}` + '.${ext}',
      copyright: 'Copyright (C) 2020 sprout2000.',
      files: ['dist/**/*'],
      directories: {
        output: 'release',
      },
      asar: true,
      asarUnpack: ['dist/preload.js'],
      mac: {
        category: 'public.app-category.developer-tools',
        target: ['dmg', 'zip'],
        icon: isSur ? 'assets/icon-sur.icns' : 'assets/icon.icns',
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
        identity: null,
      },
      dmg: {
        icon: 'assets/dmg.icns',
      },
      win: {
        icon: 'assets/icon.ico',
        target: ['nsis', 'zip'],
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
        installerIcon: 'assets/installer.ico',
        artifactName: '${productName}-${version}-${platform}-installer.${ext}',
      },
    },
  })
  .catch((err) => console.log(err));
