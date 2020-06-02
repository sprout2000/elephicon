const builder = require('electron-builder');

builder
  .build({
    config: {
      productName: 'Elephicon',
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
        buildResources: 'build',
        output: 'release',
      },
      asar: true,
      asarUnpack: ['dist/preload.js'],
      afterSign: 'scripts/notarize.js',
      mac: {
        appId: process.env.APP_BUNDLE_ID,
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
        target: ['appx'],
        fileAssociations: [
          {
            ext: ['png'],
            description: 'PNG files',
          },
        ],
      },
      appx: {
        applicationId: 'sprout2000.Elephicon',
        backgroundColor: '#1d3557',
        displayName: 'Elephicon',
        identityName: process.env.IDENTITY_NAME,
        publisher: process.env.PUBLISHER,
        publisherDisplayName: 'sprout2000',
      },
    },
  })
  .catch((err) => console.log(err));
