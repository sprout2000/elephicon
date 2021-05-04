import os from 'os';
import { build } from 'electron-builder';

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
