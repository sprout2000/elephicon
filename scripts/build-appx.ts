import dotenv from 'dotenv';
import { build } from 'electron-builder';

dotenv.config();

build({
  config: {
    productName: 'Elephicon',
    copyright: 'Copyright (C) 2020 sprout2000.',
    files: ['dist/**/*'],
    directories: {
      buildResources: 'assets',
      output: 'release',
    },
    asar: true,
    asarUnpack: ['dist/preload.js'],
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
      artifactName: '${productName}-${version}-${platform}.${ext}',
      applicationId: 'sprout2000.Elephicon',
      backgroundColor: '#1d3557',
      displayName: 'Elephicon',
      showNameOnTiles: true,
      languages: ['EN-US', 'JA-JP', 'DE-DE'],
      identityName: process.env.IDENTITY_NAME,
      publisher: process.env.PUBLISHER,
      publisherDisplayName: 'sprout2000',
    },
  },
}).catch((err) => console.log(err));
