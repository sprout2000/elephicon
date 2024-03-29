import dotenv from "dotenv";
import { build } from "electron-builder";

dotenv.config();

build({
  config: {
    productName: "Elephicon",
    artifactName: "${productName}-${version}-${platform}-${arch}.${ext}",
    copyright: "© 2020-2024 sprout2000",
    directories: {
      output: "release",
      buildResources: "assets",
    },
    publish: {
      provider: "github",
      releaseType: "release",
    },
    files: ["dist/**/*"],
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
        teamId: "285FKU3L4F",
      },
    },
  },
});
