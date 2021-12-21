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
    publish: [
      {
        provider: 'github',
        releaseType: 'release',
      },
    ],
    linux: {
      category: 'Development',
      icon: 'assets/icon.icns',
      asarUnpack: ['dist/images/logo.png'],
      target: ['zip', 'AppImage', 'deb', 'rpm'],
      mimeTypes: ['image/png'],
    },
    win: {
      icon: 'assets/icon.ico',
      target: ['appx'],
    },
    appx: {
      artifactName: '${productName}-${version}-${platform}.${ext}',
      applicationId: 'sprout2000.Elephicon',
      backgroundColor: '#1d3557',
      displayName: 'Elephicon',
      showNameOnTiles: true,
      languages: [
        'en-US',
        'ja-JP',
        'de-AT',
        'de-CH',
        'de-DE',
        'ru-RU',
        'pt-BR',
        'pt-PT',
        'it-IT',
        'it-CH',
        'zh-CN',
        'tr-TR',
      ],
      identityName: process.env.IDENTITY_NAME,
      publisher: process.env.PUBLISHER,
      publisherDisplayName: 'sprout2000',
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
      identity: process.env.UNSIGN && null,
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
      },
    },
    dmg: {
      icon: 'assets/dmg.icns',
      sign: false,
    },
    afterSign: process.env.UNSIGN ? undefined : 'scripts/notarize.ts',
  },
}).catch((err) => console.log(err));
