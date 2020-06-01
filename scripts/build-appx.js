require('dotenv').config();
const builder = require('electron-builder');

builder
  .build({
    config: {
      productName: 'Elephicon',
      copyright: 'Copyright (C) 2020 sprout2000.',
      artifactName: '${productName}-${version}-${platform}.${ext}',
      files: ['dist/**/*'],
      directories: {
        buildResources: 'build',
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
        applicationId: 'sprout2000.Elephicon',
        backgroundColor: '#1d3557',
        displayName: 'Elephicon',
        identityName: process.env.IDENTITY_NAME,
        publisher: process.env.PUBLISHER,
        publisherDisplayName: 'sprout2000',
        addAutoLaunchExtension: false,
      },
    },
  })
  .catch((err) => console.log(err));
