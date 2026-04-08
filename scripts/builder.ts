import dotenv from "dotenv";
import { build } from "electron-builder";

dotenv.config();

build({
  config: {
    productName: "Elephicon",
    artifactName: "${productName}-${version}-${platform}-${arch}.${ext}",
    copyright: "© 2020-2026 sprout2000",
    directories: {
      output: "release",
      buildResources: "assets",
    },
    publish: {
      provider: "github",
      releaseType: "release",
    },
    files: ["dist/**/*"],
    win: {
      icon: "assets/icon.ico",
      target: ["nsis", "zip"],
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
    },
  },
});
