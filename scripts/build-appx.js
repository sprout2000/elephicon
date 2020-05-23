require('dotenv').config();
const builder = require('electron-builder');

builder
  .build({
    config: {
      productName: 'gen-icons',
      copyright: 'Copyright (C) 2020 sprout2000.',
      artifactName: '${productName}-${version}-${platform}.${ext}',
      files: ['dist/**/*'],
      directories: {
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
        applicationId: 'sprout2000.gen-icons',
        backgroundColor: '#3a86ff',
        identityName: process.env.IDENTITY_NAME,
        publisher: process.env.PUBLISHER,
        publisherDisplayName: 'sprout2000',
        languages: ['EN-US'],
        addAutoLaunchExtension: false,
      },
    },
  })
  .catch((err) => console.log(err));
