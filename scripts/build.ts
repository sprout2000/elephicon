import os from 'os';
import dotenv from 'dotenv';
import { build } from 'electron-builder';

dotenv.config();

const x64 = os.arch() === 'x64';
const artifactName = x64
  ? '${productName}-${version}-${platform}-x64.${ext}'
  : '${productName}-${version}-${platform}-${arch}.${ext}';

build({
  config: {
    productName: 'Elephicon',
    artifactName: artifactName,
    copyright: 'Copyright (C) 2020 sprout2000.',
    files: ['dist/**/*'],
    directories: {
      buildResources: 'assets',
      output: 'release',
    },
    afterSign: 'scripts/notarize.ts',
    mac: {
      appId: process.env.APP_BUNDLE_ID,
      category: 'public.app-category.developer-tools',
      target: {
        target: 'default',
        arch: ['x64', 'arm64'],
      },
      icon: 'assets/icon.icns',
      extendInfo: {
        CFBundleName: 'Elephicon',
        CFBundleDisplayName: 'Elephicon',
        CFBundleExecutable: 'Elephicon',
        CFBundlePackageType: 'APPL',
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
