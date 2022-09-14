import dotenv from 'dotenv';
import { build } from 'electron-builder';

dotenv.config();

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
    linux: {
      category: 'Development',
      icon: 'assets/linux.icns',
      asarUnpack: 'dist/images/icon.png',
      target: ['AppImage'],
      mimeTypes: ['image/png'],
    },
    win: {
      icon: 'assets/icon.ico',
      target: ['zip', 'nsis'],
      publisherName: 'sprout2000',
      fileAssociations: [
        {
          ext: ['png'],
          description: 'PNG file',
        },
      ],
      asarUnpack: 'dist/images/icon.png',
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
    mac: {
      publish: [
        {
          provider: 'github',
          releaseType: 'release',
        },
      ],
      appId: process.env.APP_BUNDLE_ID,
      category: 'public.app-category.developer-tools',
      target: {
        target: 'dmg',
        arch: ['x64', 'arm64'],
      },
      icon: 'assets/icon.icns',
      extendInfo: {
        CFBundleName: 'Elephicon',
        CFBundleDisplayName: 'Elephicon',
        CFBundleExecutable: 'Elephicon',
        CFBundlePackageType: 'APPL',
        NSRequiresAquaSystemAppearance: false,
      },
    },
    afterSign:
      process.env.CSC_IDENTITY_AUTO_DISCOVERY === 'false'
        ? undefined
        : 'scripts/notarize.ts',
  },
}).catch((err) => console.log(err));
