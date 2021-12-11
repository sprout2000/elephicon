import { build } from 'electron-builder';

build({
  config: {
    productName: 'Elephicon',
    artifactName: '${productName}-${version}-${platform}-${arch}.${ext}',
    copyright: '© 2020 sprout2000 and other contributors.',
    files: ['dist/**/*'],
    directories: {
      buildResources: 'assets',
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
      artifactName:
        '${productName}-${version}-${platform}-${arch}-installer.${ext}',
    },
    linux: {
      asarUnpack: ['dist/images/logo.png'],
      icon: 'assets/icon.icns',
      target: ['AppImage', 'deb', 'zip'],
      category: 'Development',
    },
  },
}).catch((err) => console.log(err));
