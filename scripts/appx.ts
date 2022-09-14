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
    win: {
      icon: 'assets/icon.ico',
      target: ['appx'],
      asarUnpack: 'dist/images/icon.png',
    },
    appx: {
      applicationId: 'sprout2000.Elephicon',
      backgroundColor: '#ddddff',
      displayName: 'Elephicon',
      showNameOnTiles: true,
      languages: ['en-US', 'ja-JP'],
      identityName: process.env.IDENTITY_NAME,
      publisher: process.env.PUBLISHER,
      publisherDisplayName: 'sprout2000',
    },
  },
});
