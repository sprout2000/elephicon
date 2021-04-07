import { build } from 'electron-builder';

build({
  config: {
    productName: 'Elephicon',
    artifactName: '${productName}-${version}-${platform}-${arch}.${ext}',
    copyright: 'Copyright (C) 2020 sprout2000.',
    files: ['dist/**/*'],
    directories: {
      output: 'release',
    },
    mac: {
      category: 'public.app-category.developer-tools',
      target: ['dmg', 'zip'],
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
}).catch((err) => console.log(err));
