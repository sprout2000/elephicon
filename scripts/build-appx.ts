import dotenv from 'dotenv';
import { build } from 'electron-builder';

dotenv.config();

build({
  config: {
    productName: 'Elephicon',
    copyright: '© 2020 sprout2000 and other contributors.',
    files: ['dist/**/*'],
    directories: {
      buildResources: 'assets',
      output: 'release',
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
      ],
      identityName: process.env.IDENTITY_NAME,
      publisher: process.env.PUBLISHER,
      publisherDisplayName: 'sprout2000',
    },
  },
}).catch((err) => console.log(err));
