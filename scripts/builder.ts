import dotenv from "dotenv";
import { build } from "electron-builder";

dotenv.config();

build({
  config: {
    productName: "Elephicon",
    artifactName: "${productName}-${version}-${platform}-${arch}.${ext}",
    copyright: "© 2020 sprout2000 and other contributors.",
    directories: {
      output: "release",
      buildResources: "assets",
    },
    publish: {
      provider: "github",
      releaseType: "release",
    },
    files: [
      "dist/**/*",
      "!node_modules/@types/mime-types",
      "!node_modules/@types/node",
      "!node_modules/@types/react",
      "!node_modules/@types/react-dom",
      "!node_modules/@typescript-eslint/eslint-plugin",
      "!node_modules/@typescript-eslint/parser",
      "!node_modules/copy-webpack-plugin",
      "!node_modules/cross-env",
      "!node_modules/css-loader",
      "!node_modules/dotenv",
      "!node_modules/electron-builder",
      "!node_modules/electronmon",
      "!node_modules/eslint",
      "!node_modules/eslint-config-prettier",
      "!node_modules/eslint-plugin-react",
      "!node_modules/eslint-plugin-react-hooks",
      "!node_modules/html-webpack-plugin",
      "!node_modules/mini-css-extract-plugin",
      "!node_modules/npm-run-all",
      "!node_modules/prettier",
      "!node_modules/rimraf",
      "!node_modules/sass",
      "!node_modules/sass-loader",
      "!node_modules/ts-loader",
      "!node_modules/ts-node",
      "!node_modules/typescript",
      "!node_modules/wait-on",
      "!node_modules/webpack",
      "!node_modules/webpack-cli",
    ],
    linux: {
      category: "Development",
      icon: "assets/linux.icns",
      asarUnpack: "dist/images/icon.png",
      target: ["AppImage"],
      mimeTypes: ["image/png"],
    },
    win: {
      icon: "assets/icon.ico",
      target: ["nsis", "zip"],
      publisherName: "sprout2000",
      asarUnpack: "dist/images/icon.png",
    },
    nsis: {
      oneClick: false,
      perMachine: false,
      createDesktopShortcut: false,
      createStartMenuShortcut: true,
      installerIcon: "assets/installer.ico",
      artifactName:
        "${productName}-${version}-${platform}-${arch}-installer.${ext}",
    },
    appx: {
      backgroundColor: "#1d3557",
      displayName: "Elephicon",
      showNameOnTiles: true,
      languages: ["en-US", "ja-JP"],
      publisherDisplayName: "sprout2000",
      applicationId: "sprout2000.Elephicon",
      publisher: process.env.PUBLISHER,
      identityName: process.env.IDENTITY_NAME,
    },
    mac: {
      appId: "jp.wassabie64.Elephicon",
      category: "public.app-category.developer-tools",
      darkModeSupport: true,
      target: [
        {
          target: "default",
          arch: ["x64", "arm64"],
        },
      ],
      icon: "assets/icon.icns",
      extendInfo: {
        CFBundleName: "Elephicon",
        CFBundleDisplayName: "Elephicon",
        CFBundleExecutable: "Elephicon",
        CFBundlePackageType: "APPL",
        NSRequiresAquaSystemAppearance: false,
      },
      notarize: {
        appBundleId: "jp.wassabie64.Elephicon",
        teamId: "285FKU3L4F",
      },
    },
  },
});
