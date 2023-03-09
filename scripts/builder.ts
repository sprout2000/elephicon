import { build } from "electron-builder";

const isDev = process.env.NODE_ENV === "development";

build({
  config: {
    productName: "Elephicon",
    artifactName: "${productName}-${version}-${platform}-${arch}.${ext}",
    copyright: "© 2020 sprout2000 and other contributors.",
    directories: {
      output: "release",
      buildResources: "assets",
    },
    files: [
      "dist/**/*",
      "!node_modules/@electron/notarize",
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
    publish: {
      provider: "github",
      releaseType: "release",
    },
    linux: {
      category: "Development",
      icon: "assets/linux.icns",
      asarUnpack: "dist/images/icon.png",
      target: ["AppImage"],
      mimeTypes: ["image/png"],
    },
    win: {
      icon: "assets/icon.ico",
      target: ["zip", "nsis"],
      publisherName: "sprout2000",
      fileAssociations: [
        {
          ext: ["png"],
          description: "PNG file",
        },
      ],
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
    mac: {
      appId: "jp.wassabie64.Elephicon",
      category: "public.app-category.developer-tools",
      identity: isDev ? null : undefined,
      target: {
        target: "default",
        arch: ["x64", "arm64"],
      },
      icon: "assets/icon.icns",
      extendInfo: {
        CFBundleName: "Elephicon",
        CFBundleDisplayName: "Elephicon",
        CFBundleExecutable: "Elephicon",
        CFBundlePackageType: "APPL",
        NSRequiresAquaSystemAppearance: false,
      },
    },
    afterSign: isDev ? undefined : "scripts/notarizer.ts",
  },
});
