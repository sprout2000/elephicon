import dotenv from 'dotenv';
import { build } from 'electron-builder';

dotenv.config();

build({
  config: {
    productName: 'Elephicon',
    artifactName: '${productName}-${version}-${platform}-${arch}.${ext}',
    copyright: 'Copyright (C) 2020 sprout2000.',
    files: ['dist/**/*'],
    directories: {
      buildResources: 'assets',
      output: 'release',
    },
    asar: true,
    asarUnpack: ['dist/preload.js'],
    afterSign: 'scripts/notarize.ts',
    mac: {
      appId: process.env.APP_BUNDLE_ID,
      category: 'public.app-category.developer-tools',
      target: {
        target: 'default',
        arch: 'universal',
      },
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
  },
}).catch((err) => console.log(err));
