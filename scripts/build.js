const builder = require('electron-builder');

builder
  .build({
    config: {
      appId: process.env.APP_BUNDLE_ID,
      productName: 'GenICNS',
      copyright: 'Copyright (C) 2020 Office Nishigami.',
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
          CFBundleName: 'GenICNS',
          CFBundleDisplayName: 'GenICNS',
          CFBundleExecutable: 'GenICNS',
          CFBundlePackageType: 'APPL',
          CFBundleDocumentTypes: [
            {
              CFBundleTypeName: 'ImageFile',
              CFBundleTypeRole: 'None',
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
    },
  })
  .catch((err) => console.log(err));
