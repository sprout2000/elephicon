// Creates a zip of the release build in src-tauri/target/release/bundle/zip,
// since the Tauri bundler does not make zip files:
// - Windows: Elephicon.exe, which runs without installing (it needs WebView2)
// - macOS: Elephicon.app, zipped with ditto to keep its signature and links
//
// Run it after `tauri build` (`npm run release` does both).

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const releaseDir = path.join(root, "src-tauri", "target", "release");
const outDir = path.join(releaseDir, "bundle", "zip");

const PRODUCT_NAME = "Elephicon";

/** The same architecture names as the Tauri bundles (x64, aarch64). */
export const archName = (arch) => (arch === "arm64" ? "aarch64" : arch);

/** e.g. Elephicon_5.0.0_windows_x64.zip */
export const zipName = ({ version, platform, arch }) => {
  const os = { win32: "windows", darwin: "macos" }[platform];
  if (!os)
    throw new Error(
      `zip files are made on Windows and macOS only, not ${platform}`,
    );

  return `${PRODUCT_NAME}_${version}_${os}_${archName(arch)}.zip`;
};

const ensureExists = (file) => {
  if (!fs.existsSync(file)) {
    throw new Error(`${file} was not found. Run "npm run tauri build" first.`);
  }
};

const zipWindows = (zipPath) => {
  const exe = path.join(releaseDir, "elephicon.exe");
  ensureExists(exe);

  // Put the exe under the product name, like the installer does
  const staging = fs.mkdtempSync(path.join(outDir, ".staging-"));
  try {
    fs.copyFileSync(exe, path.join(staging, `${PRODUCT_NAME}.exe`));

    // The tar of Windows (bsdtar) makes zip files; the tar of Git Bash does not
    const tar = path.join(
      process.env.SystemRoot ?? "C:\\Windows",
      "System32",
      "tar.exe",
    );
    execFileSync(
      tar,
      ["-a", "-c", "-f", zipPath, "-C", staging, `${PRODUCT_NAME}.exe`],
      {
        stdio: "inherit",
      },
    );
  } finally {
    fs.rmSync(staging, { recursive: true, force: true });
  }
};

const zipMacos = (zipPath) => {
  const app = path.join(releaseDir, "bundle", "macos", `${PRODUCT_NAME}.app`);
  ensureExists(app);

  execFileSync("ditto", ["-c", "-k", "--keepParent", app, zipPath], {
    stdio: "inherit",
  });
};

const main = () => {
  const { version } = JSON.parse(
    fs.readFileSync(path.join(root, "package.json"), "utf8"),
  );
  const name = zipName({
    version,
    platform: process.platform,
    arch: process.arch,
  });
  const zipPath = path.join(outDir, name);

  fs.mkdirSync(outDir, { recursive: true });
  fs.rmSync(zipPath, { force: true });

  if (process.platform === "win32") {
    zipWindows(zipPath);
  } else {
    zipMacos(zipPath);
  }

  console.log(`Created ${path.relative(root, zipPath)}`);
};

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    main();
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}
