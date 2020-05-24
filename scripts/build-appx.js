require('dotenv').config();
const builder = require('electron-builder');

builder
  .build({
    config: {
      productName: 'genicons',
      copyright: 'Copyright (C) 2020 sprout2000.',
      artifactName: '${productName}-${version}.${ext}',
      files: ['dist/**/*'],
      directories: {
        output: 'release',
      },
      asar: true,
      asarUnpack: ['dist/preload.js'],
      win: {
        icon: 'assets/icon.ico',
        target: ['appx'],
      },
      appx: {
        applicationId: process.env.APPLICATION_ID,
        backgroundColor: '#3a86ff',
        displayName: 'genicons',
        identityName: process.env.IDENTITY_NAME,
        publisher: process.env.PUBLISHER,
        publisherDisplayName: 'sprout2000',
        languages: ['EN-US'],
        addAutoLaunchExtension: false,
      },
    },
  })
  .catch((err) => console.log(err));
