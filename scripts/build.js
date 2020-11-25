require('dotenv').config();
const builder = require('electron-builder');

const os = require('os');
const arch = os.arch();
const isSur = os.platform() === 'darwin' && parseInt(os.release()) >= 20;

builder
  .build({
    config: {
      productName: 'Elephicon',
      copyright: 'Copyright (C) 2020 sprout2000.',
      files: ['dist/**/*'],
      publish: [
        {
          provider: 'github',
          releaseType: 'release',
        },
      ],
      directories: {
        buildResources: 'assets',
        output: 'release',
      },
      asar: true,
      asarUnpack: ['dist/preload.js'],
      afterSign: 'scripts/notarize.js',
      mac: {
        appId: process.env.APP_BUNDLE_ID,
        artifactName:
          '${productName}-${version}-${platform}-' + `${arch}` + '.${ext}',
        category: 'public.app-category.developer-tools',
        target: 'default',
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
        artifactName:
          '${productName}-${version}-${platform}-' + `${arch}` + '.${ext}',
        applicationId: 'sprout2000.Elephicon',
        backgroundColor: '#1d3557',
        displayName: 'Elephicon',
        showNameOnTiles: true,
        identityName: process.env.IDENTITY_NAME,
        publisher: process.env.PUBLISHER,
        publisherDisplayName: 'sprout2000',
      },
    },
  })
  .catch((err) => console.log(err));
