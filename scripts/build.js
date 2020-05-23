const builder = require('electron-builder');

builder
  .build({
    config: {
      appId: process.env.APP_BUNDLE_ID,
      productName: 'gen-icons',
      copyright: 'Copyright (C) 2020 sprout2000.',
      artifactName: '${productName}-${version}-${platform}.${ext}',
      files: ['dist/**/*'],
      publish: [
        {
          provider: 'github',
          releaseType: 'release',
        },
      ],
      directories: {
        output: 'release',
      },
      asar: true,
      asarUnpack: ['dist/preload.js'],
      afterSign: 'scripts/notarize.js',
      mac: {
        category: 'public.app-category.developer-tools',
        target: ['dmg', 'zip'],
        icon: 'assets/icon.icns',
        extendInfo: {
          CFBundleName: 'gen-icons',
          CFBundleDisplayName: 'gen-icons',
          CFBundleExecutable: 'gen-icons',
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
          hardenedRuntime: true,
          gatekeeperAssess: false,
          entitlements: 'scripts/entitlements.plist',
          entitlementsInherit: 'scripts/entitlements.plist',
        },
      },
      dmg: {
        icon: 'assets/dmg.icns',
        sign: false,
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
        installerIcon: 'assets/installerIcon.ico',
        artifactName: '${productName}-${version}-installer.${ext}',
      },
    },
  })
  .catch((err) => console.log(err));
